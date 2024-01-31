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
    this.options = {
      maximumAge: 3000,
      timeout: 10000,
      enableHighAccuracy: false,
    };
  }

  async checkPermission() {
    this.permissionStatus = await Geolocation.checkPermissions();
    console.log("Permission status " + this.permissionStatus.location);
    if (this.permissionStatus.location != "granted") {
      this.requestStatus = await Geolocation.requestPermissions();
      if (this.requestStatus.location != "granted") {
        // go to location settings
        await this.openSettings(true);
        return;
      }
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

  openSettings(app = false) {
    console.log("open settings...");
    return NativeSettings.open({
      optionAndroid: app
        ? AndroidSettings.ApplicationDetails
        : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices,
    });
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
