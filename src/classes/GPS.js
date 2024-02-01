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
    this.enabled = true;
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
        this.enabled = false;
      }
      return;
    }
    this.granted = this.permissionStatus.location == "granted";
  }

  async checkPermission() {
    await this.readGpsPermission();

    if (!this.enabled) {
      this.granted = false;
      return;
    }

    if (this.permissionStatus.location != "granted") {
      this.requestStatus = await Geolocation.requestPermissions();

      // if (this.requestStatus.location != "granted") {
      //   // go to location settings
      //   await this.openSettings(true);
      //   return;
      // }
    }
  }

  async getCurrentPosition() {
    // if (this.permissionStatus.location != "granted") {
    //   console.log("Gps permissions not granted");
    //   return;
    // }
    let location = await Geolocation.getCurrentPosition(this.options);
    return location != null && location != undefined ? location : undefined;
  }

  async openSettings(app = false) {
    alert("open settings...");
    await NativeSettings.open({
      optionAndroid: app
        ? AndroidSettings.ApplicationDetails
        : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices,
    });
    await this.readGpsPermission();
  }

  // async enableGps() {
  //   const canRequest = await LocationAccuracy.canRequest();
  //   if (canRequest) {
  //     await LocationAccuracy.request(
  //       LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
  //     );
  //   }
  // }
}
