import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { FoodVisionResult, MediaType, scanFood } from '../lib/foodVision';

type PickedImage = {
  uri: string;
  base64: string;
  mediaType: MediaType;
};

type Status = 'idle' | 'picking' | 'scanning' | 'success' | 'error';

function inferMediaType(uri: string): MediaType {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export function useFoodVision() {
  const [status, setStatus] = useState<Status>('idle');
  const [image, setImage] = useState<PickedImage | null>(null);
  const [result, setResult] = useState<FoodVisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setImage(null);
    setResult(null);
    setError(null);
  }, []);

  const runScan = useCallback(async (picked: PickedImage) => {
    setStatus('scanning');
    setError(null);
    setResult(null);
    try {
      const r = await scanFood({ base64: picked.base64, mediaType: picked.mediaType });
      setResult(r);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Food vision request failed.';
      setError(message);
      setStatus('error');
    }
  }, []);

  const captureFromCamera = useCallback(async () => {
    setStatus('picking');
    setError(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setStatus('idle');
        setError('Camera permission was not granted.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
        exif: false,
      });
      if (result.canceled || !result.assets?.[0]) {
        setStatus('idle');
        return;
      }
      const asset = result.assets[0];
      if (!asset.base64) {
        setStatus('idle');
        setError('Could not read photo data from camera.');
        return;
      }
      const picked: PickedImage = {
        uri: asset.uri,
        base64: asset.base64,
        mediaType: inferMediaType(asset.uri),
      };
      setImage(picked);
      await runScan(picked);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera failed to open.';
      setError(message);
      setStatus('error');
    }
  }, [runScan]);

  const pickFromLibrary = useCallback(async () => {
    setStatus('picking');
    setError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setStatus('idle');
        setError('Photo library permission was not granted.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        base64: true,
        exif: false,
      });
      if (result.canceled || !result.assets?.[0]) {
        setStatus('idle');
        return;
      }
      const asset = result.assets[0];
      if (!asset.base64) {
        setStatus('idle');
        setError('Could not read photo data from library.');
        return;
      }
      const picked: PickedImage = {
        uri: asset.uri,
        base64: asset.base64,
        mediaType: inferMediaType(asset.uri),
      };
      setImage(picked);
      await runScan(picked);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Photo library failed to open.';
      setError(message);
      setStatus('error');
    }
  }, [runScan]);

  return {
    status,
    image,
    result,
    error,
    captureFromCamera,
    pickFromLibrary,
    reset,
  };
}
