import { useEffect } from 'react';
import { Platform } from 'react-native';
// TVEventHandler is not in RN 0.73 types but exists at runtime on TV platforms

const { TVEventHandler } = require('react-native');

export function useTVRemote(
  onPlayPause: () => void,
  onRewind: () => void,
  onFastForward: () => void,
) {
  useEffect(() => {
    if (!Platform.isTV) {
      return;
    }
    const handler = new TVEventHandler();

    handler.enable(null, (_cmp: any, event: { eventType: string }) => {
      switch (event?.eventType) {
        case 'playPause':
        case 'select':
          onPlayPause();
          break;
        case 'rewind':
          onRewind();
          break;
        case 'fastForward':
          onFastForward();
          break;
      }
    });
    return () => handler.disable();
  }, [onPlayPause, onRewind, onFastForward]);
}
