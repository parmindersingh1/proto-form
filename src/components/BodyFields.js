import {
  Block,
  FieldName,
  IndentationBlock,
  InlineBlock,
  LightText,
} from "./helpers";

import React from "react";

const KEY_INPUT_WIDTH = 200;
const SHORT_VALUE_INPUT_WIDTH = 300;
const LONG_VALUE_INPUT_WIDTH = 500;
const LONG_PRIMITIVE_TYPES = ["string", "bytes"];

const BodyFields = (props) => {
  const formatEnumValues = (values) => {
    let output = [];
    for (let key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        // Only show properties which were not inherited from prototype
        output.push(`${key} (${values[key]})`);
      }
    }
    return output.join(", ");
  };

  const handleInputChange = (e) => {
    console.log(e);
  };

  const { node } = props;
  return (
    <>
      {/* <div>
        <li>
          <span className="proto-field-name">{node.name}</span>
          {node.required ? "*" : ""}: {node.repeated ? "[]" : ""}
          {node.type}
          <ul>
            {node.children.map((child) => (
              <div key={child.name}>
                
                {child.kind === "basic" && (
                  <li>
                    <span className="proto-field-name">{child.name}</span>
                    {child.required ? "*" : ""}: {child.repeated ? "[]" : ""}
                    {child.type}
                  </li>
                )}
                {child.kind === "enum" && (
                  <li>
                    <span className="proto-field-name">{child.name}</span>
                    {child.required ? "*" : ""}:{child.repeated ? "[]" : ""}Enum
                    {formatEnumValues(child.values)}
                  </li>
                )}
                {child.kind === "map" && (
                  <li>
                    <span className="proto-field-name">{child.name}</span>
                    {child.required ? "*" : ""}: {child.repeated ? "[]" : ""}
                    Map {child.type[0]} - {child.type[1]}
                  </li>
                )}


              </div>
            ))}
          </ul>
        </li>
      </div> */}
<div className="container">
      <InlineBlock>
        <LightText>{node.name + " {"}</LightText>
        <IndentationBlock>
          {node.children.map((child) => (
            <div key={child.name}>
              {child.kind === "basic" && (
                <Block>
                  <FieldName>{child.name}</FieldName>
                  <span>: </span>
                  <input
                    className="input-sm"
                    placeholder={child.name}
                    value={""}
                    onChange={(e) => handleInputChange(e)}
                    style={{
                      width: LONG_PRIMITIVE_TYPES.includes(child.type)
                        ? LONG_VALUE_INPUT_WIDTH
                        : SHORT_VALUE_INPUT_WIDTH,
                    }}
                  />
                </Block>
              )}

              {child.kind === "enum" && (
                <Block>
                  <FieldName>{child.name}</FieldName>
                  <span>: </span>
                  <select
                    value={""}
                    style={{ width: SHORT_VALUE_INPUT_WIDTH }}
                    className="input-sm"
                    onChange={(e) => handleInputChange(e)}
                  >
                    {Object.keys(child.values).map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <IndentationBlock>
                    <button
                      shape="circle"
                      size="small"
                      className="btn btn-primary btn-sm"
                      // onClick={() => handlers.entryAdd("")}
                    >
                      <i className="fa fa-plus"></i> +
                    </button>
                  </IndentationBlock>
                </Block>
              )}

              {child.kind === "map" && (
                <Block>
                  <FieldName>{child.name}</FieldName>
                  <span>: </span>
                  {[child.type].map(([k, v], idx) => (
                    <IndentationBlock key={idx}>
                      <input
                        value={""}
                        style={{ width: KEY_INPUT_WIDTH, marginRight: 4 }}
                        className="input-sm"
                        onChange={(e) => handleInputChange(e)}
                      />
                      <input
                        className="input-sm"
                        placeholder={child.name}
                        value={""}
                        onChange={(e) => handleInputChange(e)}
                        style={{
                          width: LONG_PRIMITIVE_TYPES.includes(child.type)
                            ? LONG_VALUE_INPUT_WIDTH
                            : SHORT_VALUE_INPUT_WIDTH,
                        }}
                      />
                      <button
                        shape="circle"
                        className="btn btn-sm btn-danger"  
                        style={{ marginLeft: 4 }}
                        // onClick={() =>
                        //   handlers.entryRemove(`${idx.toString()}/`)
                        // }
                      >
                        <i className="fa fa-remove"></i> -
                      </button>
                    </IndentationBlock>
                  ))}

                  <IndentationBlock>
                    <button
                      shape="circle"
                      className="btn btn-primary btn-sm"
                    >
                      <i className="fa fa-plus"></i> +
                    </button>
                  </IndentationBlock>
                </Block>
              )}
            </div>
          ))}
        </IndentationBlock>
        <LightText>{"}"}</LightText>                
      </InlineBlock>
      </div>
    </>
  );
};

export default BodyFields;
