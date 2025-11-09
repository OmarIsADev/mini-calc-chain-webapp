import { POST } from "../route";
import { NextRequest } from "next/server";
import { User } from "@/models";
import connectMongoDB from "@/lib/db";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("POST /api/auth/login", () => {
  const mockConnectMongoDB = connectMongoDB as jest.Mock;
  const mockUserFindOne = User.findOne as jest.Mock;
  const mockCompare = compare as jest.Mock;
  const mockJwtSign = jwt.sign as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectMongoDB.mockResolvedValue(true);
    process.env.JWT_SECRET_KEY = "test-secret";
  });

  it("should login a user and return a token", async () => {
    const formData = new FormData();
    formData.append("username", "testuser");
    formData.append("password", "password123");

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });

    const mockUser = {
      _id: "userId1",
      username: "testuser",
      password: "hashedpassword",
    };
    mockUserFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    mockCompare.mockResolvedValue(true);
    mockJwtSign.mockReturnValue("test-token");

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ message: "Login successful" });
    expect(res.headers.get("Set-Cookie")).toContain("token=test-token");
  });

  it("should return 401 for invalid password", async () => {
    const formData = new FormData();
    formData.append("username", "testuser");
    formData.append("password", "wrongpassword");

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });

    const mockUser = {
      _id: "userId1",
      username: "testuser",
      password: "hashedpassword",
    };
    mockUserFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    mockCompare.mockResolvedValue(false);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Invalid username or password" });
  });

  it("should return 401 for non-existent user", async () => {
    const formData = new FormData();
    formData.append("username", "nonexistent");
    formData.append("password", "password123");

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: formData,
    });

    mockUserFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ error: "Invalid username or password" });
  });
});
