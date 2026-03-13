import { describe, expect, it, vi } from 'vitest';
import { GatewayClient } from '../src/main/ws/gateway-client.js';
import { PluginClient } from '../src/main/ws/plugin-client.js';

function makeDestroyedWindow() {
  return {
    isDestroyed: () => true,
    webContents: {
      isDestroyed: () => false,
      send: vi.fn(() => {
        throw new TypeError('Object has been destroyed');
      }),
    },
  };
}

describe('window safety', () => {
  it('GatewayClient ignores gateway events when its window is destroyed', () => {
    const client = new GatewayClient('token');
    const win = makeDestroyedWindow();

    client.setMainWindow(win as never);

    expect(() =>
      (client as never as { handleEvent: (frame: { event: string; payload: Record<string, unknown> }) => void })
        .handleEvent({ event: 'chat', payload: { sessionKey: 'agent:main:task-1' } }),
    ).not.toThrow();
    expect(win.webContents.send).not.toHaveBeenCalled();
  });

  it('PluginClient ignores outbound agent messages when its window is destroyed', () => {
    const client = new PluginClient();
    const win = makeDestroyedWindow();

    client.setMainWindow(win as never);

    expect(() =>
      (client as never as { handleRaw: (raw: string) => void }).handleRaw(
        JSON.stringify({
          type: 'text',
          sessionKey: 'agent:main:task-1',
          content: 'reply',
        }),
      ),
    ).not.toThrow();
    expect(win.webContents.send).not.toHaveBeenCalled();
  });
});
