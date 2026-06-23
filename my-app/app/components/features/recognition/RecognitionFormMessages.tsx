'use client';

import { Component } from "react";
import Alert from "../../ui/Alert";

type RecognitionFormMessagesProps = {
  error: string;
  success: string;
};

export default class RecognitionFormMessages extends Component<RecognitionFormMessagesProps> {
  render() {
    const { error, success } = this.props;

    return (
      <>
        {error ? (
          <Alert tone="error">{error}</Alert>
        ) : null}
        {success ? (
          <Alert tone="success">{success}</Alert>
        ) : null}
      </>
    );
  }
}
