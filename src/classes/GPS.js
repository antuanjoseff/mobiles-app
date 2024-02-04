import { Geolocation } from "@capacitor/geolocation";

import {
  NativeSettings,
  IOSSettings,
  AndroidSettings,
} from "capacitor-native-settings";

// import { LocationAccuracy } from "@awesome-cordova-plugins/location-accuracy/ngx";

export class GPS {
  constructor() {
    this.requestStatus = null;
    this.permissionStatus = null;
    this.position = null;
    this.gpsEnabled = true;
    this.granted = true;
    this.options = {
      maximumAge: 3000,
      timeout: 10000,
      enableHighAccuracy: false,
    };
  }

  async readGpsPermission() {
    try {
      this.permissionStatus = await Geolocation.checkPermissions();
    } catch (err) {
      if (err.message == "Location services are not enabled") {
        this.gpsEnabled = false;
      }
      return;
    }
    this.granted = this.permissionStatus.location == "granted";
  }

  async checkPermission() {
    await this.readGpsPermission();

    if (!this.gpsEnabled) {
      this.granted = false;
      return;
    }

    if (this.permissionStatus.location != "granted") {
      this.requestStatus = await Geolocation.requestPermissions();
    }
  }

  async getCurrentPosition() {
    let location = await Geolocation.getCurrentPosition(this.options);
    return location != null && location != undefined ? location : undefined;
  }

  async openSettings(app = false) {
    await NativeSettings.open({
      optionAndroid: app
        ? AndroidSettings.ApplicationDetails
        : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices,
    });
    await this.readGpsPermission();
  }
}
