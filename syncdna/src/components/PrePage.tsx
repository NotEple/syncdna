import { faBars, faBolt } from "@fortawesome/free-solid-svg-icons";
import { createLocalVideoTrack, LocalVideoTrack } from "livekit-client";
import {
  AudioSelectButton,
  ControlButton,
  VideoSelectButton,
} from "@livekit/react-components";
import { VideoRenderer } from "@livekit/react-core";
import { ReactElement, useEffect, useState } from "react";
import { AspectRatio } from "react-aspect-ratio";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Loading from "./Loading";

export const PreJoinPage = () => {
  const [room, setRoom] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  localStorage.setItem("room", room);
  localStorage.setItem("name", name);

  const [, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  // disable connect button unless validated
  const [connectDisabled, setConnectDisabled] = useState(true);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const navigate = useNavigate();

  // checks to see if the room and name inputs are empty
  useEffect(() => {
    if (name && room) {
      setConnectDisabled(false);
    } else {
      setConnectDisabled(true);
    }
  }, [name, room]);

  // toggle video on or off
  const toggleVideo = async () => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoEnabled(false);
      setVideoTrack(undefined);
    } else {
      const track = await createLocalVideoTrack({
        deviceId: videoDevice?.deviceId,
      });
      setVideoEnabled(true);
      setVideoTrack(track);
    }
  };

  // toggle audio on or off
  const toggleAudio = () => {
    if (audioEnabled) {
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
    }
  };

  // useEffect will run on page load, and in this case it will enable video by default
  useEffect(() => {
    // enable video by default
    createLocalVideoTrack({
      deviceId: videoDevice?.deviceId,
    }).then((track) => {
      setVideoEnabled(true);
      setVideoTrack(track);
    });
  }, [videoDevice]);

  // display a modal with all video devices available on the device
  const selectVideoDevice = (device: MediaDeviceInfo) => {
    setVideoDevice(device);
    if (videoTrack) {
      if (
        videoTrack.mediaStreamTrack.getSettings().deviceId === device.deviceId
      ) {
        return;
      }
      // stop video
      videoTrack.stop();
    }
  };

  // connect to a room and change the parameters in the url to match the room name
  const connectToRoom = async () => {
    if (videoTrack) {
      videoTrack.stop();
    }
    navigate({
      pathname: "room",
      search: "?" + room.toString().replace(" ", "/"),
    });
  };

  let videoElement: ReactElement;
  if (videoTrack) {
    videoElement = <VideoRenderer track={videoTrack} isLocal={true} />;
  } else {
    videoElement = <div className="placeholder" />;
  }

  // requst a token required to connect to a video call
  const requestToken = async () => {
    // loading state while requesting a token from the server
    setLoading(true);

    const options = {
      method: "GET",
      url: "https://peaceful-lowlands-47521.herokuapp.com/token",
      params: { name: name, room: room },
    };
    // send the name and room name from the user to the server
    axios.request(options).then((response) => {
      // store the token we got from the server in local storage
      localStorage.setItem("token", response.data);
      sessionStorage.setItem("token", response.data);
    });
    setTimeout(() => {
      connectToRoom();
      setLoading(false);
    }, 1000);
  };

  // generate a random room name, recommended as it would be harder to guess && to get a duplicate
  const randomRoomFunc = () => {
    setRoom(`${randomString(5)}-${randomString(5)}`);
  };
  // create a random room name
  function randomString(length: number): string {
    let result = "";
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  return (
    <section className="container">
      <div className="conferance_top">
        <h1 className="conferance_title">SyncDNA Video Conferance</h1>
        <FontAwesomeIcon className="conferance_icon" icon={faBars} />
      </div>
      <div className="conferance_join">
        <label>Room Name</label>
        <input
          type="text"
          name="url"
          placeholder="Random room name is recommended..."
          value={room}
          onChange={(e) => {
            setRoom(e.target.value.toLocaleLowerCase());
          }}
        />
        <div className="button_container">
          <button className="conferance_random" onClick={randomRoomFunc}>
            Generate name
          </button>
          <button className="conferance_random" onClick={() => setRoom("")}>
            Clear
          </button>
        </div>
        <label>Username</label>
        <input
          type="text"
          name="url"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <ControlButton
          className="conferance_button"
          label="Join"
          disabled={connectDisabled}
          icon={faBolt}
          onClick={requestToken}
        />
      </div>
      <div className="video_container">
        {loading ? <Loading /> : null}
        <AspectRatio ratio={16 / 9}>{videoElement}</AspectRatio>
      </div>
      <div className="buttoncontainer">
        <AudioSelectButton
          muteText=""
          unmuteText=""
          className="conferance headset"
          isMuted={!audioEnabled}
          onClick={toggleAudio}
          onSourceSelected={setAudioDevice}
          popoverContainerClassName="audio settings"
        />
        <VideoSelectButton
          disableText=""
          enableText=""
          className="conferance video"
          isEnabled={videoTrack !== undefined}
          onClick={toggleVideo}
          onSourceSelected={selectVideoDevice}
          popoverContainerClassName="video settings"
        />
      </div>
    </section>
  );
};
