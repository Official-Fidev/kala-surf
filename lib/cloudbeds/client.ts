import "server-only";

import type {
  AddOn,
  AvailabilityInput,
  AvailabilityResponse,
  BookingInput,
  BookingResponse,
  RoomOption,
} from "@/lib/cloudbeds/types";

type HttpMethod = "GET" | "POST";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface EndpointCandidate {
  path: string;
  method: HttpMethod;
  query?: Record<string, string | number | undefined>;
  body?: Record<string, unknown>;
  authType?: "bearer" | "apiKey";
  contentType?: "json" | "form";
}

type CloudbedsJson = Record<string, unknown>;

let tokenCache: TokenCache | null = null;

export class CloudbedsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "CloudbedsApiError";
  }
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getConfig() {
  const clientId = getEnv("CLOUDBEDS_CLIENT_ID");
  const apiKeyFromClientId = clientId.startsWith("cbat_") ? clientId : undefined;

  return {
    clientId,
    clientSecret: getEnv("CLOUDBEDS_SECRET"),
    tokenUrl: process.env.CLOUDBEDS_TOKEN_URL?.trim() || "https://api.cloudbeds.com/oauth/token",
    apiBaseUrl: process.env.CLOUDBEDS_API_BASE_URL?.trim() || "https://api.cloudbeds.com",
    propertyId: process.env.CLOUDBEDS_PROPERTY_ID?.trim(),
    availabilityPath: process.env.CLOUDBEDS_AVAILABILITY_PATH?.trim(),
    bookingPath: process.env.CLOUDBEDS_BOOKING_PATH?.trim(),
    apiKey: process.env.CLOUDBEDS_API_KEY?.trim() || apiKeyFromClientId,
  };
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(path, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken;
  }

  const cfg = getConfig();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });

  const response = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload) {
    throw new CloudbedsApiError("Gagal mendapatkan access token Cloudbeds", response.status, cfg.tokenUrl, payload);
  }

  const accessToken =
    typeof payload.access_token === "string"
      ? payload.access_token
      : typeof payload.token === "string"
        ? payload.token
        : null;

  const expiresInRaw =
    typeof payload.expires_in === "number"
      ? payload.expires_in
      : typeof payload.expiresIn === "number"
        ? payload.expiresIn
        : 3600;

  if (!accessToken) {
    throw new CloudbedsApiError("Response token Cloudbeds tidak valid", response.status, cfg.tokenUrl, payload);
  }

  tokenCache = {
    accessToken,
    expiresAt: now + Math.max(60, expiresInRaw) * 1000,
  };

  return accessToken;
}

async function callCloudbeds<T>(candidate: EndpointCandidate): Promise<T> {
  const cfg = getConfig();
  const authType = candidate.authType ?? "bearer";
  const token = authType === "bearer" ? await getAccessToken() : null;

  if (authType === "apiKey" && !cfg.apiKey) {
    throw new CloudbedsApiError(
      "Missing API key for Cloudbeds endpoint that requires x-api-key",
      500,
      candidate.path,
    );
  }

  const endpoint = buildUrl(cfg.apiBaseUrl, candidate.path, candidate.query);
  const contentType = candidate.contentType ?? "json";

  const headers: Record<string, string> = {
    ...(authType === "bearer" && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(authType === "apiKey" && cfg.apiKey ? { "x-api-key": cfg.apiKey } : {}),
    Accept: "application/json",
  };

  let body: string | URLSearchParams | undefined;

  if (candidate.method === "POST") {
    if (contentType === "json") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(candidate.body ?? {});
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      const params = new URLSearchParams();
      
      const flatten = (data: any, prefix = "") => {
        if (data === null || data === undefined) return;
        
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            flatten(item, prefix ? `${prefix}[${index}]` : `${index}`);
          });
        } else if (typeof data === "object") {
          Object.entries(data).forEach(([key, value]) => {
            flatten(value, prefix ? `${prefix}[${key}]` : key);
          });
        } else {
          params.append(prefix, String(data));
        }
      };

      flatten(candidate.body ?? {});
      body = params;
    }
  }

  const response = await fetch(endpoint, {
    method: candidate.method,
    headers,
    body,
    cache: "no-store",
  });

  const payload = (await response.json().catch(async () => ({ raw: await response.text().catch(() => "") }))) as unknown;

  if (!response.ok) {
    throw new CloudbedsApiError("Cloudbeds API error", response.status, endpoint, payload);
  }

  return payload as T;
}

async function fetchRoomTypesForEnrichment(propertyId?: string): Promise<Map<string, CloudbedsJson>> {
  const response = await callCloudbeds<unknown>({
    path: "/api/v1.3/getRoomTypes",
    method: "GET",
    authType: "apiKey",
    query: {
      propertyIDs: propertyId,
      pageSize: 200,
    },
  });

  const root = (response ?? {}) as CloudbedsJson;
  const rawData = root.data ?? root.result ?? root.response ?? root;
  const rows = Array.isArray(rawData) ? rawData : [];

  const index = new Map<string, CloudbedsJson>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as CloudbedsJson;
    const id = String(record.roomTypeID ?? record.roomTypeId ?? "");
    if (!id) continue;
    index.set(id, record);
  }

  return index;
}

async function fetchRatePlansForPricing(
  input: AvailabilityInput,
  propertyId?: string,
): Promise<Map<string, { price?: number; roomsAvailable?: number; rateId?: string }>> {
  const response = await callCloudbeds<unknown>({
    path: "/api/v1.3/getRatePlans",
    method: "GET",
    authType: "apiKey",
    query: {
      propertyIDs: propertyId,
      startDate: input.checkIn,
      endDate: input.checkOut,
      pageSize: 200,
    },
  });

  const root = (response ?? {}) as CloudbedsJson;
  const rows = Array.isArray(root.data) ? root.data : [];

  const index = new Map<string, { price?: number; roomsAvailable?: number; rateId?: string }>();

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as CloudbedsJson;

    const roomTypeId = String(record.roomTypeID ?? record.roomTypeId ?? "");
    if (!roomTypeId) continue;

    const price =
      asNumber(record.roomRate) ?? asNumber(record.totalRate) ?? asNumber(record.rate) ?? asNumber(record.amount);
    const roomsAvailable = asNumber(record.roomsAvailable);
    const rateId = record.rateID ? String(record.rateID) : record.rateId ? String(record.rateId) : undefined;

    const existing = index.get(roomTypeId);
    if (!existing) {
      index.set(roomTypeId, { price, roomsAvailable, rateId });
      continue;
    }

    // Keep the lowest available price for each room type.
    const nextPrice =
      existing.price === undefined
        ? price
        : price === undefined
          ? existing.price
          : Math.min(existing.price, price);

    index.set(roomTypeId, {
      price: nextPrice,
      roomsAvailable: Math.max(existing.roomsAvailable ?? 0, roomsAvailable ?? 0),
      rateId: existing.rateId ?? rateId,
    });
  }

  return index;
}

async function callWithFallbacks<T>(candidates: EndpointCandidate[]): Promise<{ data: T; sourceEndpoint: string }> {
  let lastError: CloudbedsApiError | null = null;

  for (const candidate of candidates) {
    try {
      console.log(`[Cloudbeds] Attempting endpoint: ${candidate.method} ${candidate.path} (Auth: ${candidate.authType ?? 'bearer'})`);
      const data = await callCloudbeds<T>(candidate);
      console.log(`[Cloudbeds] Success at: ${candidate.path}`);
      return { data, sourceEndpoint: candidate.path };
    } catch (error) {
      if (!(error instanceof CloudbedsApiError)) {
        console.error(`[Cloudbeds] Network or unexpected error at ${candidate.path}:`, error);
        // Continue to next candidate if this one failed at network level
        continue;
      }
      
      console.warn(`[Cloudbeds] Failed candidate ${candidate.path}: HTTP ${error.status}`, error.details);
      lastError = error;

      if (error.status === 401 || error.status === 403 || error.status === 422) {
        throw error;
      }

      if (error.status !== 404 && error.status !== 405) {
        throw error;
      }
    }
  }

  if (lastError) {
    console.error(`[Cloudbeds] All candidates exhausted. Last error: ${lastError.message} (Status: ${lastError.status})`);
    throw lastError;
  }

  throw new Error("Tidak ada endpoint Cloudbeds yang bisa dipakai");
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return [];
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function inferRoomCategory(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("dorm")) return "Dorm";
  if (value.includes("family")) return "Family";
  if (value.includes("surf") || value.includes("bc")) return "Surf Package";
  return "Private Room";
}

function mapRoomOption(row: Record<string, unknown>, index: number): RoomOption {
  const relatedRoomType =
    row.roomType && typeof row.roomType === "object" ? (row.roomType as Record<string, unknown>) : undefined;

  const roomTypeId = String(
    row.roomTypeId ??
      row.roomTypeID ??
      row.room_type_id ??
      relatedRoomType?.roomTypeID ??
      relatedRoomType?.roomTypeId ??
      row.id ??
      row.roomId ??
      `room-${index + 1}`,
  );

  const photos = asArray(row.roomTypePhotos ?? relatedRoomType?.roomTypePhotos ?? row.photos ?? row.roomPhotos).filter(
    (item) => typeof item === "string" && item.length > 0,
  ) as string[];

  const featureRaw = row.roomTypeFeatures ?? relatedRoomType?.roomTypeFeatures;
  const features = Array.isArray(featureRaw)
    ? featureRaw.map((item) => String(item))
    : featureRaw && typeof featureRaw === "object"
      ? Object.values(featureRaw as Record<string, unknown>).map((item) => String(item))
      : undefined;

  const roomTypeName = String(row.roomTypeName ?? relatedRoomType?.roomTypeName ?? row.room_name ?? row.name ?? `Room ${index + 1}`);

  return {
    roomTypeId,
    category: inferRoomCategory(roomTypeName),
    propertyId:
      row.propertyID
        ? String(row.propertyID)
        : row.propertyId
          ? String(row.propertyId)
          : relatedRoomType?.propertyID
            ? String(relatedRoomType.propertyID)
            : undefined,
    roomTypeName,
    roomTypeNameShort:
      row.roomTypeNameShort
        ? String(row.roomTypeNameShort)
        : relatedRoomType?.roomTypeNameShort
          ? String(relatedRoomType.roomTypeNameShort)
          : undefined,
    ratePlanId: row.ratePlanId ? String(row.ratePlanId) : row.ratePlanID ? String(row.ratePlanID) : undefined,
    ratePlanName: row.ratePlanName ? String(row.ratePlanName) : row.rate_name ? String(row.rate_name) : undefined,
    price:
      asNumber(row.price) ?? asNumber(row.totalRate) ?? asNumber(row.rate) ?? asNumber(row.amount) ?? undefined,
    available:
      typeof row.available === "boolean"
        ? row.available
        : typeof row.isAvailable === "boolean"
          ? row.isAvailable
          : (asNumber(row.availableRooms) ?? asNumber(row.roomsAvailable) ?? asNumber(relatedRoomType?.roomTypeUnits) ?? asNumber(row.roomTypeUnits) ?? 1) > 0,
    imageUrl: photos[0],
    photos,
    description: row.roomTypeDescription
      ? String(row.roomTypeDescription)
      : relatedRoomType?.roomTypeDescription
        ? String(relatedRoomType.roomTypeDescription)
        : undefined,
    maxGuests: asNumber(row.maxGuests) ?? asNumber(relatedRoomType?.maxGuests),
    adultsIncluded: asNumber(row.adultsIncluded) ?? asNumber(relatedRoomType?.adultsIncluded),
    childrenIncluded: asNumber(row.childrenIncluded) ?? asNumber(relatedRoomType?.childrenIncluded),
    roomsAvailable: asNumber(row.roomsAvailable) ?? asNumber(row.availableRooms),
    roomTypeUnits: asNumber(row.roomTypeUnits) ?? asNumber(relatedRoomType?.roomTypeUnits),
    isPrivate: typeof row.isPrivate === "boolean" ? row.isPrivate : undefined,
    features,
    rawData: row,
  };
}

function mergeRoomTypeData(room: RoomOption, roomType?: CloudbedsJson): RoomOption {
  if (!roomType) return room;

  const photos = asArray(roomType.roomTypePhotos).filter(
    (item) => typeof item === "string" && item.length > 0,
  ) as string[];

  const featureRaw = roomType.roomTypeFeatures;
  const features = Array.isArray(featureRaw)
    ? featureRaw.map((item) => String(item))
    : featureRaw && typeof featureRaw === "object"
      ? Object.values(featureRaw as Record<string, unknown>).map((item) => String(item))
      : room.features;

  return {
    ...room,
    roomTypeName: room.roomTypeName || String(roomType.roomTypeName ?? room.roomTypeName),
    roomTypeNameShort:
      room.roomTypeNameShort ||
      (typeof roomType.roomTypeNameShort === "string" && roomType.roomTypeNameShort.length > 0
        ? roomType.roomTypeNameShort
        : undefined),
    description:
      room.description || (typeof roomType.roomTypeDescription === "string" ? roomType.roomTypeDescription : undefined),
    maxGuests: room.maxGuests ?? asNumber(roomType.maxGuests),
    adultsIncluded: room.adultsIncluded ?? asNumber(roomType.adultsIncluded),
    childrenIncluded: room.childrenIncluded ?? asNumber(roomType.childrenIncluded),
    roomTypeUnits: room.roomTypeUnits ?? asNumber(roomType.roomTypeUnits),
    isPrivate: room.isPrivate ?? (typeof roomType.isPrivate === "boolean" ? roomType.isPrivate : undefined),
    photos: room.photos && room.photos.length > 0 ? room.photos : photos,
    imageUrl: room.imageUrl || photos[0],
    features,
    rawData: {
      ...(room.rawData ?? {}),
      roomType,
    },
  };
}

function dedupeByRoomType(rooms: RoomOption[]): RoomOption[] {
  const grouped = new Map<string, RoomOption>();

  for (const room of rooms) {
    const key = room.roomTypeId;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...room,
        roomTypeUnits: room.roomTypeUnits ?? 1,
        roomsAvailable: room.roomsAvailable ?? (room.available ? 1 : 0),
      });
      continue;
    }

    existing.roomTypeUnits = (existing.roomTypeUnits ?? 0) + (room.roomTypeUnits ?? 1);
    existing.roomsAvailable = (existing.roomsAvailable ?? 0) + (room.roomsAvailable ?? (room.available ? 1 : 0));
    existing.available = (existing.roomsAvailable ?? 0) > 0;

    if (!existing.imageUrl && room.imageUrl) existing.imageUrl = room.imageUrl;
    if ((!existing.photos || existing.photos.length === 0) && room.photos && room.photos.length > 0) {
      existing.photos = room.photos;
    }
    if ((!existing.features || existing.features.length === 0) && room.features && room.features.length > 0) {
      existing.features = room.features;
    }
  }

  return Array.from(grouped.values());
}

function normalizeAvailability(payload: unknown, sourceEndpoint: string): AvailabilityResponse {
  const root = (payload ?? {}) as Record<string, unknown>;
  const rawData = root.data ?? root.result ?? root.response ?? root;
  const data = (rawData ?? {}) as Record<string, unknown>;
  let roomRows: unknown[];

  if (Array.isArray(rawData)) {
    const wrappedRows = rawData.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (Array.isArray(record.rooms)) return record.rooms;
      return [record];
    });
    roomRows = wrappedRows;
  } else {
    roomRows = asArray(data.rooms ?? data.availability ?? root.rooms ?? root.availability ?? data.roomTypes ?? root.roomTypes);
  }

  const mappedRooms = roomRows.map((item, index) => mapRoomOption((item ?? {}) as Record<string, unknown>, index));
  const rooms = dedupeByRoomType(mappedRooms);

  const firstRoom = rooms[0];

  return {
    propertyId:
      (data.propertyId as string | undefined) ||
      (root.propertyId as string | undefined) ||
      (data.propertyID as string | undefined) ||
      firstRoom?.propertyId,
    currency: (data.currency as string | undefined) || (root.currency as string | undefined),
    rooms,
    sourceEndpoint,
  };
}

function normalizeBooking(payload: unknown, sourceEndpoint: string): BookingResponse {
  const root = (payload ?? {}) as Record<string, unknown>;
  console.log("[Cloudbeds] Raw booking response structure:", JSON.stringify(root, null, 2));

  if (root.success === false) {
    throw new Error(String(root.message || root.error || "Cloudbeds API returned success: false"));
  }
  
  const data = (root.data ?? root.result ?? root.response ?? root) as Record<string, unknown>;

  const reservationId = String(
    data.reservationId ??
      data.reservation_id ??
      data.bookingId ??
      data.booking_id ??
      data.reservationID ??
      data.reservation_ID ??
      data.bookingID ??
      data.id ??
      root.reservationId ??
      root.reservationID ??
      root.id ??
      "",
  );

  if (!reservationId) {
    throw new Error("Booking request accepted, but no reservationId was found in the response.");
  }

  return {
    reservationId,
    status: String(data.status ?? root.status ?? "confirmed"),
    sourceEndpoint,
  };
}

export async function fetchItems(propertyId?: string): Promise<AddOn[]> {
  const cfg = getConfig();
  const response = await callCloudbeds<unknown>({
    path: "/api/v1.3/getItems",
    method: "GET",
    authType: "apiKey",
    query: {
      propertyIDs: propertyId || cfg.propertyId,
      pageSize: 100,
    },
  });

  const root = (response ?? {}) as CloudbedsJson;
  const rawData = root.data ?? root.result ?? root.response ?? root;
  const rows = Array.isArray(rawData) ? rawData : [];

  return rows.map((row: any) => ({
    itemId: String(row.itemID || row.itemId || row.id || ""),
    name: String(row.itemName || row.name || ""),
    description: String(row.itemDescription || row.description || ""),
    price: asNumber(row.itemPrice || row.price || 0) || 0,
    imageUrl: row.itemImage || row.imageUrl || row.image || undefined,
  })).filter(item => item.itemId);
}

export async function fetchAvailability(input: AvailabilityInput): Promise<AvailabilityResponse> {
  const cfg = getConfig();
  const payload: Record<string, unknown> = {
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    checkInDate: input.checkIn,
    checkOutDate: input.checkOut,
    adults: input.adults,
    children: input.children,
    propertyId: cfg.propertyId,
  };

  const candidates: EndpointCandidate[] = [
    {
      path: "/api/v1.3/getRooms",
      method: "GET",
      authType: "apiKey",
      query: {
        propertyIDs: cfg.propertyId,
        includeRoomRelations: 1,
        pageSize: 100,
      },
    },
    {
      path: "/api/v1.3/getRoomTypes",
      method: "GET",
      authType: "apiKey",
    },
    ...(cfg.availabilityPath ? [{ path: cfg.availabilityPath, method: "POST" as const, body: payload }] : []),
    {
      path: "/api/v1.1/getAvailability",
      method: "GET",
      authType: "bearer",
      query: {
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        adults: input.adults,
        children: input.children,
        propertyId: cfg.propertyId,
      },
    },
    { path: "/api/v1.1/availability", method: "POST", authType: "bearer", body: payload },
    { path: "/v1/availability", method: "POST", authType: "bearer", body: payload },
  ];

  const { data, sourceEndpoint } = await callWithFallbacks<unknown>(candidates);
  const normalized = normalizeAvailability(data, sourceEndpoint);

  // getRooms does not reliably include photos/descriptions, so enrich with getRoomTypes.
  if (sourceEndpoint === "/api/v1.3/getRooms") {
    try {
      const roomTypeIndex = await fetchRoomTypesForEnrichment(cfg.propertyId);
      normalized.rooms = normalized.rooms.map((room) => mergeRoomTypeData(room, roomTypeIndex.get(room.roomTypeId)));
    } catch {
      // Non-fatal: keep basic room list even if enrichment fails.
    }
  }

  // Enrich with rates so UI can show real room prices.
  try {
    const pricingIndex = await fetchRatePlansForPricing(input, cfg.propertyId);

    if (sourceEndpoint === "/api/v1.3/getRooms") {
      if (pricingIndex.size === 0) {
        // No rate rows for selected dates: treat as no availability.
        normalized.rooms = [];
      } else {
        normalized.rooms = normalized.rooms
          .map((room) => {
            const pricing = pricingIndex.get(room.roomTypeId);

            if (!pricing) {
              return {
                ...room,
                roomsAvailable: 0,
                available: false,
              };
            }

            return {
              ...room,
              price: pricing.price ?? room.price,
              roomsAvailable: pricing.roomsAvailable ?? room.roomsAvailable ?? 0,
              available: (pricing.roomsAvailable ?? 0) > 0,
              ratePlanId: room.ratePlanId ?? pricing.rateId,
            };
          })
          .filter((room) => room.available);
      }
    } else {
      normalized.rooms = normalized.rooms.map((room) => {
        const pricing = pricingIndex.get(room.roomTypeId);
        if (!pricing) return room;

        return {
          ...room,
          price: pricing.price ?? room.price,
          roomsAvailable: pricing.roomsAvailable ?? room.roomsAvailable,
          available: pricing.roomsAvailable !== undefined ? pricing.roomsAvailable > 0 : room.available,
          ratePlanId: room.ratePlanId ?? pricing.rateId,
        };
      });
    }
  } catch {
    // Non-fatal: keep room list even if rates are unavailable.
  }

  // Filter rooms by capacity (adults)
  const requestedAdults = input.adults || 1;
  console.log(`[Cloudbeds] Filtering rooms for requested adults: ${requestedAdults}`);
  
  normalized.rooms = normalized.rooms.filter(room => {
    // If maxGuests is defined, it must be >= requestedAdults.
    const capacity = room.maxGuests;
    const isAllowed = capacity === undefined || capacity === null || capacity >= requestedAdults;
    
    console.log(`[Cloudbeds] Room: ${room.roomTypeName} | Capacity: ${capacity} | Allowed: ${isAllowed}`);
    return isAllowed;
  });

  return normalized;
}

export async function createBooking(input: BookingInput): Promise<BookingResponse> {
  const cfg = getConfig();
  
  const guestGender = input.notes?.includes("Gender: M") ? "M" : "F";
  const eta = input.notes?.match(/ETA: (\d{2}:\d{2})/)?.[1] || "14:00";

  const payload: Record<string, unknown> = {
    // Strictly v1.3 parameters
    propertyID: cfg.propertyId,
    startDate: input.checkIn,
    endDate: input.checkOut,
    guestFirstName: input.firstName,
    guestLastName: input.lastName,
    guestEmail: input.email,
    guestPhone: input.phone,
    guestCountry: input.country || "ID",
    guestZip: "00000",
    guestGender: guestGender,
    estimatedArrivalTime: eta,
    paymentMethod: "not_paid",
    
    // Object-based arrays required by v1.3
    rooms: [
      {
        roomTypeID: input.roomTypeId,
        quantity: 1,
      }
    ],
    adults: [
      {
        roomTypeID: input.roomTypeId,
        quantity: input.adults,
      }
    ],
    children: [
      {
        roomTypeID: input.roomTypeId,
        quantity: input.children,
      }
    ],
    items: (input.items || []).map(id => ({
      itemID: id,
      itemQuantity: 1,
    })),
  };

  const candidates: EndpointCandidate[] = [
    // Priority 1: v1.3 API (matching user documentation)
    { 
      path: "/api/v1.3/postReservation", 
      method: "POST", 
      authType: "apiKey", 
      body: payload,
      contentType: "form",
    },
    // Priority 2: v1.1 API (API Key)
    { 
      path: "/api/v1.1/postReservation", 
      method: "POST", 
      authType: "apiKey", 
      body: payload,
      contentType: "form",
      query: { startDate: input.checkIn, endDate: input.checkOut }
    },
    // Priority 3: Bearer/OAuth endpoints (fallback)
    { 
      path: "/api/v1.3/postReservation", 
      method: "POST", 
      authType: "bearer", 
      body: payload,
      contentType: "form",
    },
  ];

  const { data, sourceEndpoint } = await callWithFallbacks<unknown>(candidates);
  return normalizeBooking(data, sourceEndpoint);
}
