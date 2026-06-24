'use client';

import { Component } from "react";
import Alert from "../../ui/Alert";

type FormMessagesProps = {
  error: string;
  success: string;
};

export default class FormMessages extends Component<FormMessagesProps> {
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
