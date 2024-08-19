import { describe, expect, it } from "vitest";
import {
  convertBytes,
  convertTime,
  formatTime,
  Unit,
} from "../src/utils/FrontendUtils";

describe("convertBytes", () => {
  it("converts bytes to MB", () => {
    expect(convertBytes(1024 * 1024, Unit.MB)).toBe(1);
  });

  it("converts bytes to GB", () => {
    expect(convertBytes(1024 * 1024 * 1024, Unit.GB)).toBe(1);
  });
});

describe("convertTime", () => {
  it("converts seconds to minutes", () => {
    expect(convertTime(120)).toBe("2 minutes ago");
  });

  it("handles singular minute", () => {
    expect(convertTime(60)).toBe("1 minute ago");
  });

  it("converts seconds to hours", () => {
    expect(convertTime(7200)).toBe("2 hours ago");
  });

  it("handles singular hour", () => {
    expect(convertTime(3600)).toBe("60 minutes ago");
  });
});

describe("formatTime", () => {
  it("formats time correctly for multiple hours, minutes and seconds", () => {
    expect(formatTime(3665)).toBe("1:01:05");
  });

  it("pads single digit minutes and seconds", () => {
    expect(formatTime(65)).toBe("0:01:05");
  });

  it("handles exactly one hour", () => {
    expect(formatTime(3600)).toBe("1:00:00");
  });

  it("handles less than one minute", () => {
    expect(formatTime(25)).toBe("0:00:25");
  });
});
