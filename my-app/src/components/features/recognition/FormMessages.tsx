'use client';

import { Component } from "react";
import Toast from "../../ui/Toast";

type FormMessagesProps = {
  error: string;
  success: string;
  onClearError?: () => void;
  onClearSuccess?: () => void;
};

export default class FormMessages extends Component<FormMessagesProps> {
  render() {
    const { error, success, onClearError = () => { }, onClearSuccess = () => { } } = this.props;

    return (
      <>
        {error ? (
          <Toast type="error" message={error} onClose={onClearError} />
        ) : null}
        {success ? (
          <Toast type="success" message={success} onClose={onClearSuccess} />
        ) : null}
      </>
    );
  }
}
