import { fireEvent, render } from "@testing-library/react";
import { vi } from "vitest";

import ChatInput from "./ChatInput";

describe("ChatInput component", () => {
  it("should render the ChatInput component and match the snapshot", () => {
    const onSendMessageMock = vi.fn();
    const { asFragment } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test("should call onSendMessage with the message when Enter is pressed", () => {
    const onSendMessageMock = vi.fn();
    const { getByPlaceholderText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    const input = getByPlaceholderText("Type your message...");
    fireEvent.change(input, { target: { value: "Hello, World!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(onSendMessageMock).toHaveBeenCalledWith("Hello, World!");
  });

  test("should not call onSendMessage if Enter is pressed with an empty message", () => {
    const onSendMessageMock = vi.fn();
    const { getByPlaceholderText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    const input = getByPlaceholderText("Type your message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });

  test("should not send when Shift+Enter is pressed", () => {
    const onSendMessageMock = vi.fn();
    const { getByPlaceholderText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    const input = getByPlaceholderText("Type your message...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      shiftKey: true,
    });

    expect(onSendMessageMock).not.toHaveBeenCalled();
  });

  test("should send message when send button is clicked", () => {
    const onSendMessageMock = vi.fn();
    const { getByPlaceholderText, getByLabelText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    fireEvent.change(getByPlaceholderText("Type your message..."), {
      target: { value: "Hello via button" },
    });
    fireEvent.click(getByLabelText("Send message"));

    expect(onSendMessageMock).toHaveBeenCalledWith("Hello via button");
  });

  test("send button is disabled when message is empty", () => {
    const onSendMessageMock = vi.fn();
    const { getByLabelText } = render(
      <ChatInput onSendMessage={onSendMessageMock} />,
    );

    expect(getByLabelText("Send message")).toBeDisabled();
  });

  test("send button is disabled when disabled prop is true", () => {
    const onSendMessageMock = vi.fn();
    const { getByLabelText } = render(
      <ChatInput
        onSendMessage={onSendMessageMock}
        disabled={true}
      />,
    );

    expect(getByLabelText("Send message")).toBeDisabled();
  });
});
