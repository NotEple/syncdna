import {
  ControlBar,
  LiveKitRoom,
  ParticipantName,
  RoomAudioRenderer,
  TrackContext,
  TrackLoop,
  TrackMutedIndicator,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { useNavigate } from "react-router-dom";
import "@livekit/components-styles";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Track } from "livekit-client";
import { isTrackReference } from "@livekit/components-core";
import Placeholder from "./Placeholder";
import ErrorMessage from "./ErrorMessage";

const url = import.meta.env.VITE_URL;

export function CallRoom() {
  const navigate = useNavigate();

  // leave function that will redirect to the home page and delete the token from local storage
  const onLeave = () => {
    navigate("/");
    localStorage.removeItem("token");
  };

  // get the token from local storage
  const token = localStorage.getItem("token") || "";

  if (!sessionStorage.getItem("token") || !localStorage.getItem("token")) {
    return (
      <ErrorMessage
        redirect={true}
        status={401}
        message="No authentication token provided"
      />
    );
  }

  return (
    <section className="container" data-lk-theme="default">
      <div className="conferance_top">
        <h1 className="conferance_title">SyncDNA Video Conferance</h1>
        <FontAwesomeIcon className="conferance_icon" icon={faBars} />
      </div>
      <LiveKitRoom
        serverUrl={url}
        token={token}
        connect={true}
        onDisconnected={onLeave}>
        {/*<VideoConference />*/}
        <Stage />
        <ControlBar
          variation="minimal"
          controls={{
            microphone: true,
            camera: true,
            chat: false,
            screenShare: false,
          }}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </section>
  );
}

function Stage() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  return (
    <div className="cr-grid-layout">
      <TrackLoop tracks={tracks}>
        <TrackContext.Consumer>
          {(track) =>
            track && (
              <div className="cr-grid-participant">
                {isTrackReference(track) ? (
                  <VideoTrack {...track} />
                ) : (
                  <Placeholder />
                )}
                <div className="cr-grid-indicator">
                  <TrackMutedIndicator
                    source={Track.Source.Microphone}></TrackMutedIndicator>
                  <TrackMutedIndicator
                    source={track.source}></TrackMutedIndicator>
                </div>
                <ParticipantName className={"cr-my-participant-name"} />
              </div>
            )
          }
        </TrackContext.Consumer>
      </TrackLoop>
    </div>
  );
}
