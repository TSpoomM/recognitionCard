'use client';

import { Component } from "react";

export default class RecognitionHeader extends Component {
  render() {
    return (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Recognition Card</p>
        </div>
      </div>
    );
  }
}
