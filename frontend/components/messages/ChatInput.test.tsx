import "@testing-library/jest-dom";

import React from "react";

import { render } from "@testing-library/react";

import ChatInput from "./ChatInput";

describe("ChatInput component", () => {
  it("should render the ChatInput component and match the snapshot", () => {
    const onSendMessageMock = jest.fn(); // Mock function for onSendMessage
    const { asFragment } = render(
      <ChatInput onSendMessage={onSendMessageMock} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
