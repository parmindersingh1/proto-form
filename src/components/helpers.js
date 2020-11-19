import React from "react";

export const IndentationBlock = ({ children }) => (
  <div
    style={{
      display: "block",
      marginLeft: "6px",
      margin: "2px 2px 2px 10px",
      padding: "2px",
    }}
  >
    {children}
  </div>
);

export const Block = ({ children }) => (
  <div style={{ display: "block", margin: "4px 0", padding: "2px" }}>
    {children}
  </div>
);

export const InlineBlock = ({ children }) => (
  <div style={{ display: "inline", margin: "4px 0", padding: "2px" }}>
    {children}
  </div>
);

export const LightText = ({ children }) => (
  <span style={{ color: "gray" }}>{children}</span>
);

export const FieldName = ({ children }) => (
  <span style={{ width: "50px" }}>{children}</span>
);

export const allPrimitiveTypes = [
  "double",
  "float",
  "int32",
  "int64",
  "uint32",
  "uint64",
  "sint32",
  "sint64",
  "fixed32",
  "fixed64",
  "sfixed32",
  "sfixed64",
  "bool",
  "string",
  "bytes",
];

// Change Value Helpers

// export const changeValue = (v, segments, value) => {
//   switch (v.type.tag) {
//     case "message":
//       return changeMessageValue(v, segments, value);
//     case "primitive":
//       return changePrimitiveValue(v, segments, value);
//     case "enum":
//       return changeEnumValue(v, segments, value);
//   }
// }

// export const changeMessageValue = (msg, segments, value) => {
//   const fieldName = segments[0];
//   const [field, repeatedField, oneOfField, mapField] = findField(
//     msg,
//     fieldName
//   );

//   if (field) {
//     changeValue(field, segments.slice(1), value);
//   } else if (repeatedField) {
//     const idx = parseInt(segments[1]);
//     changeValue(repeatedField[idx], segments.slice(2), value);
//   } else if (oneOfField) {
//     const [, selectedValue] = oneOfField;
//     // although segments[1](subfieldName) isn't used,
//     // it's included in the path just in case we later decide that we need it.
//     // i.e. rather than keeping just the selected value,
//     // we might keep all values to preserve user inputs.
//     changeValue(selectedValue, segments.slice(2), value);
//   } else if (mapField) {
//     const idx = parseInt(segments[1]);
//     const isKey = parseInt(segments[2]) === 0;
//     if (isKey) {
//       mapField[idx][0] = value;
//     } else {
//       changeValue(mapField[idx][1], segments.slice(3), value);
//     }
//   }
// }

// export const changePrimitiveValue = (v, segment, value) => {
//   console.assert(segment.length === 1 && segment[0] === "");
//   v.value = value;
// }

// export const changeEnumValue = (v, segment, value) => {
//   console.assert(segment.length === 1 && segment[0] === "");
//   v.selected = value;
// }

// // Change Field Helpers

// export const changeField = (v, segments, value, ctx) => {
//   switch (v.type.tag) {
//     case "message":
//       return changeMessageField(v, segments, value, ctx);
//     case "primitive":
//       return console.assert(false, "Can't change field of a primitive");
//     case "enum":
//       return console.assert(false, "Can't change field of an enum");
//   }
// }

// export const changeMessageField = (msg, segments, value, ctx) => {
//   const fieldName = segments[0];
//   const [field, repeatedField, oneOfField, mapField] = findField(
//     msg,
//     fieldName
//   );

//   if (field) {
//     changeField(field, segments.slice(1), value, ctx);
//   } else if (repeatedField) {
//     const idx = parseInt(segments[1]);
//     changeField(repeatedField[idx], segments.slice(2), value, ctx);
//   } else if (oneOfField) {
//     const [, selectedValue] = oneOfField;
//     if (segments.length === 2) {
//       const newTypeName = getByKey(
//         getByKey(msg.type.oneOfFields, fieldName),
//         value
//       );
//       if (newTypeName) {
//         const newV = typeToDefaultValue(ctx.types[newTypeName], ctx);
//         const e = getEntryByKey(msg.oneOfFields, fieldName);
//         if (e) {
//           e[1] = [value, newV];
//         }
//       }
//     } else {
//       changeField(selectedValue, segments.slice(2), value, ctx);
//     }
//   } else if (mapField) {
//     const idx = parseInt(segments[1]);
//     const isKey = parseInt(segments[2]) === 0;
//     if (isKey) {
//       console.assert(false, "Can't change field of a key");
//     } else {
//       changeField(mapField[idx][1], segments.slice(3), value, ctx);
//     }
//   }
// }

// // Add Entry Helpers

// export const addEntry = (v, segments, ctx) => {
//   switch (v.type.tag) {
//     case "message":
//       return addMessageEntry(v, segments, ctx);
//     case "primitive":
//       return console.assert(false, "Can't add entry to a primitive");
//     case "enum":
//       return console.assert(false, "Can't add entry to an enum");
//   }
// }

// export const addMessageEntry = (msg, segments, ctx) => {
//   const fieldName = segments[0];
//   const [field, repeatedField, oneOfField, mapField] = findField(
//     msg,
//     fieldName
//   );

//   if (field) {
//     addEntry(field, segments.slice(1), ctx);
//   } else if (repeatedField) {
//     if (segments.length === 2) {
//       const newTypeName = getByKey(msg.type.repeatedFields, fieldName);
//       if (newTypeName) {
//         const newV = typeToDefaultValue(ctx.types[newTypeName], ctx);
//         repeatedField.push(newV);
//       }
//     } else {
//       const idx = parseInt(segments[1]);
//       addEntry(repeatedField[idx], segments.slice(2), ctx);
//     }
//   } else if (oneOfField) {
//     const [, selectedValue] = oneOfField;
//     addEntry(selectedValue, segments.slice(2), ctx);
//   } else if (mapField) {
//     if (segments.length == 2) {
//       const kvTypeNames = getByKey(msg.type.mapFields, fieldName);
//       if (kvTypeNames) {
//         const [kTypeName, vTypeName] = kvTypeNames;
//         const newK = ctx.types[kTypeName].defaultValue; // guaranteed by protoc
//         const newV = typeToDefaultValue(ctx.types[vTypeName], ctx);
//         mapField.push([newK, newV]);
//       }
//     } else {
//       const idx = parseInt(segments[1]);
//       const isKey = parseInt(segments[2]) === 0;
//       if (isKey) {
//         console.assert(false, "Can't add entry to a key");
//       } else {
//         addEntry(mapField[idx][1], segments.slice(3), ctx);
//       }
//     }
//   }
// }

// // Remove Entry Helpers

// export const removeEntry = (v, segments) => {
//   switch (v.type.tag) {
//     case "message":
//       return removeMessageEntry(v, segments);
//     case "primitive":
//       return console.assert(false, "Can't remove entry of a primitive");
//     case "enum":
//       return console.assert(false, "Can't remove entry of an enum");
//   }
// }

// export const removeMessageEntry = (msg, segments) => {
//   const fieldName = segments[0];
//   const [field, repeatedField, oneOfField, mapField] = findField(
//     msg,
//     fieldName
//   );

//   if (field) {
//     removeEntry(field, segments.slice(1));
//   } else if (repeatedField) {
//     const idx = parseInt(segments[1]);
//     if (segments.length === 3) {
//       delete repeatedField[idx];
//     } else {
//       removeEntry(repeatedField[idx], segments.slice(2));
//     }
//   } else if (oneOfField) {
//     const [, selectedValue] = oneOfField;
//     removeEntry(selectedValue, segments.slice(2));
//   } else if (mapField) {
//     const idx = parseInt(segments[1]);
//     if (segments.length == 3) {
//       delete mapField[idx];
//     } else {
//       const isKey = parseInt(segments[2]) === 0;
//       if (isKey) {
//         console.assert(false, "Can't remove entry of a key");
//       } else {
//         removeEntry(mapField[idx][1], segments.slice(3));
//       }
//     }
//   }
// }

// // helper helper

// export const findField = (v, fieldName) => {
//   return [
//     getByKey(v.singleFields, fieldName),
//     getByKey(v.repeatedFields, fieldName),
//     getByKey(v.oneOfFields, fieldName),
//     getByKey(v.mapFields, fieldName),
//   ];
// }

// export const typeToDefaultValue = (type, ctx) => {
//   switch (type.tag) {
//     case 'message':
//       return genDefaultMessage(type, ctx);
//     case 'primitive':
//       return genDefaultPrimitive(type);
//     case 'enum':
//       return genDefaultEnum(type);
//   }
// }
