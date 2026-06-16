export function getDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device or browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Enable GPS to punch attendance.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Unable to determine your location. Try again near a window or outdoors.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Failed to get device location'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export const formatCoordinates = (latitude, longitude) => {
  if (latitude == null || longitude == null) return '—';
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

export const getVerificationLabel = (atWorkplace, workplaceConfigured) => {
  if (!workplaceConfigured) return 'Location recorded';
  if (atWorkplace === true) return 'At workplace';
  if (atWorkplace === false) return 'Outside workplace';
  return 'Not verified';
};
