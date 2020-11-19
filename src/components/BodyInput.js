import React from "react";

const BodyInput = (props) => {
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

  const { node } = props;
  return (
    <>
      <div>
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
      </div>
    </>
  );
};

export default BodyInput;
