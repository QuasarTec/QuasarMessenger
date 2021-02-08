/* @flow */

import React, { Component } from 'react';

import { translate } from '../../base/i18n';
import { RecordStart } from '../../base/icons';
import { RecordStop } from '../../base/icons';
import { RecordPause } from '../../base/icons';
import { RecordResume } from '../../base/icons';
import { ToolbarButton } from '../../toolbox/components/web';

import RecordRTC from "recordrtc"
import { saveAs } from 'file-saver';

/**
 * The type of the React {@code Component} state of
 * {@link LocalRecordingButton}.
 */
type Props = {

    /**
     * Whether or not {@link LocalRecordingInfoDialog} should be displayed.
     */
    isDialogShown: boolean,

    /**
     * Callback function called when {@link LocalRecordingButton} is clicked.
     */
    onClick: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
}

type State = {
    recorder: RecordRTC.MultiStreamRecorder,
    recordingPaused: Boolean
}

/**
 * A React {@code Component} for opening or closing the
 * {@code LocalRecordingInfoDialog}.
 *
 * @extends Component
 */
class LocalRecordingButton extends Component<Props, State> {

    /**
     * Initializes a new {@code LocalRecordingButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            recorder: null,
            recordingPaused: false
        }

        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this.stopRecordingVideo       = this.stopRecordingVideo.bind(this);
        this.startRecordingVideo      = this.startRecordingVideo.bind(this);
        this.pauseRecordingVideo      = this.pauseRecordingVideo.bind(this);
    }

    blobToFile(theBlob, fileName){
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return theBlob;
    }

    stopRecordingVideo() {
        if (this.state.recorder === null) {
            return;
        }
        this.setState({ recorder: null })
        this.state.recorder.stop((blob) => {
            saveAs(this.blobToFile(blob, `Record from ${new Date().toString()}`));
        });
    };

    findStreams() {
        var streams = [];
        var videoElements = document.getElementsByTagName("video");
    
        for (let i = 0; i < videoElements.length; i++) {
            streams.push(videoElements[i].captureStream())
        }

        return streams
    }

    startRecordingVideo() {
        this.setState({
            recorder: new RecordRTC.MultiStreamRecorder(this.findStreams(), {
                mimeType: "video/webm"
            })
        }, () => {
            this.state.recorder.record();
        });
        
    }

    pauseRecordingVideo() {
        if (this.state.recordingPaused == false) {
            this.state.recorder.pause();
            this.setState({ recordingPaused: true })
        } else {
            this.state.recorder.resume();
            this.setState({ recordingPaused: false })
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { isDialogShown, t } = this.props;

        return (
            <div>
            { this.state.recorder !== null &&
                <ToolbarButton
                    accessibilityLabel
                        = { t('toolbar.accessibilityLabel.localRecording') }
                    icon = { this.state.recordingPaused == false ? RecordPause : RecordResume }
                    onClick = { this.pauseRecordingVideo }
                    toggled = { isDialogShown }
                    tooltip = { t('localRecording.dialogTitle') } />
            }
                <ToolbarButton
                    accessibilityLabel
                        = { t('toolbar.accessibilityLabel.localRecording') }
                    icon = { this.state.recorder === null ? RecordStart : RecordStop }
                    onClick = { this.state.recorder === null ? this.startRecordingVideo : this.stopRecordingVideo}
                    toggled = { isDialogShown }
                    tooltip = { t('localRecording.dialogTitle') } />
            </div>
        );
    }

    _onClick: () => void;

    /**
     * Callback invoked when the Toolbar button is clicked.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this.props.onClick();
    }
}

export default translate(LocalRecordingButton);
