import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";

const secretValue = process.env.SESSION_TOKEN_SECRET;

if (!secretValue) {
  throw new Error("SESSION_TOKEN_SECRET is not configured");
}

const secretKey = Buffer.from(secretValue, "base64url");

if (secretKey.length !== 32) {
  throw new Error(
    "SESSION_TOKEN_SECRET must decode to exactly 32 bytes"
  );
}

export type SessionTokenPayload = {
  session_id: number;
  user_id: number;
  user_uuid: string;
};

export async function encryptSessionToken(
  payload: SessionTokenPayload,
  expiresAt: Date
): Promise<string> {
  return new EncryptJWT({
    session_id: payload.session_id,
    user_id: payload.user_id,
    user_uuid: payload.user_uuid,
  })
    .setProtectedHeader({
      alg: "dir",
      enc: "A256GCM",
    })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .encrypt(secretKey);
}

export async function decryptSessionToken(
  token: string
): Promise<SessionTokenPayload> {
  const { payload } = await jwtDecrypt(token, secretKey, {
    keyManagementAlgorithms: ["dir"],
    contentEncryptionAlgorithms: ["A256GCM"],
  });

  return parseSessionPayload(payload);
}

function parseSessionPayload(
  payload: JWTPayload
): SessionTokenPayload {
  const sessionId = payload.session_id;
  const userId = payload.user_id;
  const userUuid = payload.user_uuid;
  const role = payload.role;

  if (
    typeof sessionId !== "number" ||
    typeof userId !== "number" ||
    typeof userUuid !== "string" 
  ) {
    throw new Error("Invalid session token payload");
  }

  return {
    session_id: sessionId,
    user_id: userId,
    user_uuid: userUuid,
  };
}