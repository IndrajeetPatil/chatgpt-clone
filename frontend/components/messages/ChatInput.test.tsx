import "@testing-library/jest-dom";

import { fireEvent, render } from "@testing-library/react";

import ChatInput from "./ChatInput";

describe("ChatInput component", () => {
  it("should render the ChatInput component and match the snapshot", () => {
    const onSendMessageMock = jest.fn();
    const { asFragment } = render(
      <ChatInput onSendMessage={onSendMessageMock} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test("should call onSendMessage with the message when Enter is pressed", () => {
    const onSendMessageMock = jest.fn();
    const { getByPlaceholderText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />
    );

    const input = getByPlaceholderText("Type your message...");
    fireEvent.change(input, { target: { value: "Hello, World!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(onSendMessageMock).toHaveBeenCalledWith("Hello, World!");
  });

  test("should not call onSendMessage if Enter is pressed with an empty message", () => {
    const onSendMessageMock = jest.fn();
    const { getByPlaceholderText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />
    );

    const input = getByPlaceholderText("Type your message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });
});
