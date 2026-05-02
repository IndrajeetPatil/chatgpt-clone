import { ThemeProvider, createTheme } from "@mui/material";
import { renderHook } from "@testing-library/react";
import type React from "react";

import { useIsDark } from "./hooks";

const makeWrapper =
  (mode: "dark" | "light") =>
  ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={createTheme({ palette: { mode } })}>
      {children}
    </ThemeProvider>
  );

describe("useIsDark", () => {
  test("returns true when palette mode is dark", () => {
    const { result } = renderHook(() => useIsDark(), {
      wrapper: makeWrapper("dark"),
    });
    expect(result.current).toBe(true);
  });

  test("returns false when palette mode is light", () => {
    const { result } = renderHook(() => useIsDark(), {
      wrapper: makeWrapper("light"),
    });
    expect(result.current).toBe(false);
  });
});
