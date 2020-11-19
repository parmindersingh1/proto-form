import * as parser from 'proto-parser'

import React from "react";

const FileInput = (props) => {
  const parseProtoFile = (file) => {
    if(!file) return;
    let reader = new FileReader();
    reader.onload = () => {
      parseProtoContents(reader.result);
    };
    reader.readAsText(file);
  };

  const parseProtoContents = (protoFileText) => {
    let proto = parser.parse(protoFileText);
    console.log("proto", proto);
    props.handleOnChange(proto);
  };

  return (
    <>
      <div>
        <div
          className="jumbotron"
          style={{padding: "2rem 2rem"}}
        ></div>

        <div className="container">
          <div className="card">
            <div className="form">
              <div
                className="form-group"
                id="input-group-proto-file"
                label="Protobuf .proto file:"
                label-for="input-proto-file"
              >
                <input
                  type="file"
                  accept=".proto"
                  className="form-cintrol"
                  onChange={(e) => parseProtoFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FileInput;
