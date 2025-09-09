import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  // Permission
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setMediaLibraryPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState<"on" | "off">("off");

  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, []);

  if (!cameraPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasMediaLibraryPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting media library permission...</Text>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const newPhoto = await cameraRef.current.takePictureAsync({ quality: 1 });
        setImage(newPhoto.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (image && hasMediaLibraryPermission) {
      try {
        await MediaLibrary.createAssetAsync(image);
        alert("Saved to gallery!");
        setImage(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={{ flex: 1, width: "100%" }} />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
            <Ionicons name="refresh" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSaveToGallery}>
            <Ionicons name="save" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1, width: "100%" }}
        facing={facing}
        flash={flash}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={() => setFacing(facing === "back" ? "front" : "back")}>
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
          <Ionicons name="camera" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setFlash(flash === "off" ? "on" : "off")}>
          <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    backgroundColor: "#ff4d4d",
    padding: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
