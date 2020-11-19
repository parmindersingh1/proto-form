import {
  Block,
  FieldName,
  IndentationBlock,
  InlineBlock,
  LightText,
} from "./helpers";

import React from "react";
import { getByKey } from "../utils/utils";

function prefix(prefix, h) {
  return {
    valueChange: (p, v, type, field) =>
      h.valueChange(`${prefix}/${p}`, v, type, field),
    fieldChange: (p, t, type, field) =>
      h.fieldChange(`${prefix}/${p}`, t, type, field),
    entryAdd: (p, type, field) => h.entryAdd(`${prefix}/${p}`, type, field),
    entryRemove: (p, type, field) => h.entryRemove(`${prefix}/${p}`, type, field),
  };
}

const KEY_INPUT_WIDTH = 200;
const SHORT_VALUE_INPUT_WIDTH = 300;
const LONG_VALUE_INPUT_WIDTH = 500;
const LONG_PRIMITIVE_TYPES = ["string", "bytes"];

// const IndentationBlock = styled('div')`
//   display: block;
//   margin-left: 6px;
//   margin: 2px 2px 2px 10px;
//   padding: 2px;
// `;

const MessageValueView = ({ editable, value, handlers }) => {
  const { type, singleFields, repeatedFields, oneOfFields, mapFields } = value;

  console.log("values", value);

  return (
    <InlineBlock>
      <LightText>{type.name + " {"}</LightText>
      <IndentationBlock>
        {/* {console.log("singleFields", singleFields)} */}
        {singleFields.map((field) => {
          const [fieldName, value] = field;
          return (
            <SingleFieldView
              key={fieldName}
              editable={editable}
              fieldName={fieldName}
              value={value}
              handlers={prefix(fieldName, handlers)}
            />
          );
        })}
        {repeatedFields.map((field) => {
          const [fieldName, values] = field;
          return (
            <RepeatedFieldView
              key={fieldName}
              editable={editable}
              fieldName={fieldName}
              values={values}
              handlers={prefix(fieldName, handlers)}
            />
          );
        })}
        {oneOfFields.map(([fieldName, selectedField]) => {
          // const options = getByKey(type.oneOfFields, fieldName)?.map(
          //   ([name]) => name
          // );
          const options = Object.keys(type.fields) || [];
          console.log("&&&&", fieldName, options);

          return (
            <OneOfFieldView
              key={fieldName}
              editable={editable}
              fieldOptions={options || []}
              fieldName={fieldName}
              selectedField={selectedField}
              handlers={prefix(fieldName, handlers)}
            />
          );
        })}
        {mapFields.map((field) => {
          const [fieldName, entries] = field;
          return (
            <MapFieldView
              key={fieldName}
              editable={editable}
              fieldName={fieldName}
              kvPairs={entries}
              handlers={prefix(fieldName, handlers)}
            />
          );
        })}
      </IndentationBlock>
      <LightText>{"}"}</LightText>
    </InlineBlock>
  );
};

const PrimitiveValueView = ({ editable, value, handlers, type: inputType }) => {
  const { type, value: v } = value;

  return (
    <>
      <input
        size="small"
        // addonAfter={<LightText>{type.name}</LightText>}
        placeholder={type.name}
        readOnly={!editable}
        colored={editable.toString()}
        value={v}
        style={{
          width: LONG_PRIMITIVE_TYPES.includes(type.name)
            ? LONG_VALUE_INPUT_WIDTH
            : SHORT_VALUE_INPUT_WIDTH,
        }}
        onChange={(e) => handlers.valueChange("", e.target.value, inputType, value)}       
      />
      <span
        style={{
          display: "inline-block",
          marginLeft: "4px",
          padding: "1px 4px",
          border: "1px solid rgb(217,217,217)",
          borderRadius: "4px",
        }}
      >
        <LightText>{type.name}</LightText>
      </span>
    </>
  );
};

const EnumValueView = ({ editable, value, handlers, type: inputType }) => {
  const { type, selected } = value;
  const { options } = type;

  const style = {
    width: SHORT_VALUE_INPUT_WIDTH,
  };

  return editable ? (
    <select
      value={selected}
      {...(editable ? {} : { open: false })}
      style={style}
      size="small"
      onChange={(s) => handlers.valueChange("", s.target.value, inputType, value)}
    >
      {options.map((option, idx) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  ) : (
    <span>{selected}</span>
  );
};

const ProtobufValueView = ({ editable, value, handlers, type }) => {
  if (!value || !value.type) return null;
  switch (value.type.tag) {
    case "message":
      return (
        <MessageValueView
          editable={editable}
          value={value}
          handlers={handlers}
        />
      );
    case "primitive":
      return (
        <PrimitiveValueView
          editable={editable}
          value={value}
          handlers={handlers}
          type={type}
        />
      );
    case "enum":
      return (
        <EnumValueView
          editable={editable}
          value={value}
          handlers={handlers}
          type={type}
        />
      );
  }
};

const SingleFieldView = ({ editable, fieldName, value, handlers, type }) => {
  return (
    <Block>
      <FieldName>{fieldName}</FieldName>
      <span>: </span>
      <ProtobufValueView
        editable={editable}
        value={value}
        handlers={handlers}
        type={type || "SingleField"}
      />
    </Block>
  );
};

const RepeatedFieldView = ({ editable, fieldName, values, handlers }) => {
  console.log("repeated", values);
  return (
    <Block>
      <FieldName>{fieldName}</FieldName>
      <span>: </span>
      {values.map((v, idx) => (
        <IndentationBlock key={idx}>
          <ProtobufValueView
            editable={editable}
            value={v}
            handlers={prefix(idx.toString(), handlers)}
            type="RepeatedField"
          />
          {editable ? (
            <button
              shape="circle"
              className="btn btn-sm btn-danger"
              style={{ marginLeft: 4 }}
              onClick={() =>
                handlers.entryRemove(`${idx.toString()}/`, "RepeatedField")
              }
            >
              <i className="fa fa-remove"></i> -
            </button>
          ) : null}
        </IndentationBlock>
      ))}
      {editable ? (
        <IndentationBlock>
          <button
            shape="circle"
            className="btn btn-primary btn-sm"
            onClick={() => handlers.entryAdd("", "RepeatedField")}
          >
            <i className="fa fa-plus"></i> +
          </button>
        </IndentationBlock>
      ) : null}
    </Block>
  );
};

const OneOfFieldView = ({
  editable,
  fieldOptions,
  fieldName,
  selectedField,
  handlers,
}) => {
  const [name, value] = selectedField;
  return (
    <Block>
      <FieldName>{fieldName}</FieldName>
      <span>: </span>
      {editable && (
        <select
          value={name}
          className="input-sm"
          style={{ width: KEY_INPUT_WIDTH }}
          onChange={(s) =>
            handlers.fieldChange("", s.target.value, "OneOfField")
          }
          type="OneOfField"
        >
          {fieldOptions.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      <IndentationBlock>
        <SingleFieldView
          editable={editable}
          fieldName={name}
          value={value}
          handlers={prefix(name, handlers)}
          type="OneOfField"
        />
      </IndentationBlock>
    </Block>
  );
};

const MapFieldView = ({ editable, fieldName, kvPairs, handlers }) => {
  console.log("kvpairs", kvPairs);
  return (
    <Block>
      <FieldName>{fieldName}</FieldName>
      <span>: </span>
      {kvPairs.map(([k, v], idx) => (
        <IndentationBlock key={idx}>
          <input
            value={k}
            style={{ width: KEY_INPUT_WIDTH, marginRight: 4 }}
            colored={editable.toString()}
            size="small"
            onChange={(e) =>
              handlers.valueChange(
                `${idx.toString()}/0/`,
                e.target.value,
                "MapField",
                kvPairs[idx]
              )
            }
          />
          <ProtobufValueView
            editable={editable}
            value={v}
            handlers={prefix(`${idx.toString()}/1`, handlers)}
            type="MapField"
          />
          {editable ? (
            <button
              shape="circle"
              className="btn btn-sm btn-danger"
              style={{ marginLeft: 4 }}
              onClick={() =>
                handlers.entryRemove(`${idx.toString()}/`, "MapField")
              }
            >
              <i className="fa fa-remove"></i> -
            </button>
          ) : null}
        </IndentationBlock>
      ))}
      {editable ? (
        <IndentationBlock>
          <button
            shape="circle"
            className="btn btn-primary btn-sm"
            onClick={() => handlers.entryAdd("", "MapField")}
          >
            <i className="fa fa-plus"></i> +
          </button>
        </IndentationBlock>
      ) : null}
    </Block>
  );
};

export default MessageValueView;
