import React, { Component } from "react";

import BodyFields from "./BodyFields";
import BodyInput from "./BodyInput";
import { cloneDeep } from "lodash";

class Renderer extends Component {
  state = {
    currentMessage: null,
    currentMessageName: "",
    messageList: [],
    currentNode: null,
  };

  // messageList = () => {
  //   // Get values for select
  //   return Object.keys(this.props.messages)
  //     .map((message) => this.props.messages[message])
  //     .sort();
  // };

  componentDidMount() {
    const messageList = Object.keys(this.props.messages)
      .map((message) => this.props.messages[message])
      .sort();
    if (!this.state.currentMessageName) {
      this.setState({
        currentMessageName: messageList[0].name,
        messageList,
        currentMessage: messageList[0],
      });

      this.parseNode(messageList[0]);
    }
  }

  parseNode = (message) => {
    console.log("mesage", message);
    // Local copy of root node
    let rootNode = {
      name: message.name,
      kind: "nested",
      type: message.name,
      children: this.getChildren(message),
    };
    // Return root node
    console.log("rootNode", rootNode);
    this.setState({ currentNode: cloneDeep(rootNode) });
  };

  typeMap = () => {
    let result = {};
    for (let key in this.props.messages) {
      // Extract message
      let message = this.props.messages[key];

      // Store current message in map
      let type = message.fullName;
      result[this.convertToDollarKey(type)] = message;

      // Get nested types and store in map
      let types = this.getNestedTypes(message);
      Object.assign(result, types);
    }

    return result;
  };

  getNestedTypes = (message) => {
    let result = {};
    if (typeof message.nested !== "undefined") {
      for (let key in message.nested) {
        // Extract nested type
        let nestedType = message.nested[key];

        // Store current type in map
        let type = nestedType.fullName;
        result[this.convertToDollarKey(type)] = nestedType;

        // Get nested types and store in map
        let types = this.getNestedTypes(nestedType);
        Object.assign(result, types);
      }
    }
    return result;
  };

  convertToDollarKey = (key) => {
    return key.replace(/\./g, "$");
  };

  getChildren = (message) => {
    let fields = [];
    if (typeof message.fields !== "undefined") {
      for (let fieldName in message.fields) {
        let field = message.fields[fieldName];
        if (field.type.syntaxType === "BaseType") {
          if (field.map) {
            // Map field
            fields.push({
              name: field.name,
              kind: "map",
              repeated: field.repeated,
              required: field.required,
              type: [field.keyType.value, field.type.value ],
              map: field.map,
            });
          } else {
            // Simple field
            fields.push({
              name: field.name,
              kind: "basic",
              repeated: field.repeated,
              required: field.required,
              type: field.type.value,
              map: field.map,
            });
          }
        } else {
          // Field references another message or enum
          let key = this.convertToDollarKey(field.type.resolvedValue);
          let referencedType = this.typeMap()[key];

          if (typeof referencedType === "undefined") {
            // Type not found in current file
            console.warn(
              `Field ${field.fullName}: Key "${key}" not found in types of document`
            );
            fields.push({
              name: field.name,
              kind: "basic",
              repeated: field.repeated,
              required: field.required,
              type: field.type.value + " (not in document)",
            });
            continue;
          }

          if (referencedType.syntaxType === "EnumDefinition") {
            // Type is Enum
            fields.push({
              name: field.name,
              kind: "enum",
              repeated: field.repeated,
              required: field.required,
              values: referencedType.values,
            });
          } else {
            // Type is message
            fields.push({
              name: field.name,
              kind: "nested",
              repeated: field.repeated,
              required: field.required,
              type: field.type.value,
              children: this.getChildren(referencedType),
            });
          }
        }
      }
    }

    return fields;
  };

  handleChange = (event) => {
    const message = event.target.value;
    this.setState({
      currentMessageName: message,
      currentMessage: this.props.messages[message],
    });
    this.parseNode(this.props.messages[message]);
  };

  render() {
    const { currentNode } = this.state;
    return (
      <>
        <div>
          <div className="container pt-3">
            <div className="row text-center">
              <div className="col-2">
                {/* <p className="h1">{{ pkg }}</p>  */}
              </div>
              <div className="col-4">
                <div
                  className="form-group"
                  id="input-group-message"
                  label="Message: "
                >
                  <select
                    className="form-control"
                    value={this.state.currentMessageName}
                    onChange={this.handleChange}
                    id="input-message"
                  >
                    {this.state.messageList.map((list, i) => (
                      <option key={i} value={list.name}>
                        {list.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-6"></div>
            </div>

            <hr />
          </div>

          <hr />
          {currentNode && <BodyFields node={currentNode} />}
        </div>
      </>
    );
  }
}

export default Renderer;
