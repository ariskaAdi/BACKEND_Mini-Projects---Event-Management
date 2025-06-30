import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hash";

jest.mock("bcrypt");

describe("test hashing password", () => {
  it("should return hashed password", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("fake-hashedPassword");

    const newPassword = await hashPassword("1234");
    expect(newPassword).toBe("fake-hashedPassword");
  });
});
