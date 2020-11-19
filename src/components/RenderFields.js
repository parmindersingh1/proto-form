import React, { Component } from "react";
import { cloneDeep, isArray } from "lodash";

import MessageValueView from "./MessageValueView";
import { allPrimitiveTypes } from "./helpers";

class RenderFields extends Component {
  state = {
    currentMessage: null,
    messageList: [],
    currentNode: null,
  };

  componentDidMount() {
    this.initMessages();
  }

  valueChange = (p, v, type, field) => {
    let fieldName = p.split("/");
    console.log("valueChange", p, v, fieldName, type, field);
    this.updateCurrentNode(fieldName, type, v, field);
  };

  fieldChange = (p, t, type, field) => {
    console.log("valueChange", p, t, type, field);
    field[0] = t;
    const fieldType = this.state.currentNode.type.fields[field[0]];
    field[1] = this.resolveTypeName(fieldType);
    this.setState({
      currentNode: {
        ...this.state.currentNode,
      },
    });
  };
  
  entryAdd = (p, type, field) => {
    let fieldName = p.split("/");
    console.log("valueChange", p, type, field);
    this.addEntry(fieldName, type, field);
  };
  entryRemove = (p, type, field) => {
    let fieldName = p.split("/");
    console.log("valueChange", p, type, field);
    this.removeEntry(fieldName, type, field);
  };

  initMessages() {
    const messageList = Object.keys(this.props.messages)
      .map((message) => this.props.messages[message])
      .sort();

    this.setState({
      messageList,
      currentMessage: messageList[0],
    });

    let message = this.createMessage(messageList[0]);
    this.setMessages(messageList[0], message);
  }

  setCurrentMessage(message) {
    this.setState({
      currentMessage: message,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.messages !== this.props.messages) {
      console.log("UPDATE RENDER FIELDS");
      this.initMessages();
    }
  }

  createMessage = (currentMessage) => {
    if (currentMessage.syntaxType === "MessageDefinition") {
      return this.createMessageType(currentMessage);
    } else if (currentMessage.syntaxType === "EnumDefinition") {
      return this.createEnumType(currentMessage);
    }
  };

  createMessageType = (messageType) => {
    const repeatedFields = [];
    let oneOfFields = [];
    const singleFields = [];
    const mapFields = [];
    console.log("messageType", messageType);
    Object.values(messageType.fields).forEach((field) => {
      // const resolvedField = field.resolve();
      if (field.repeated) {
        repeatedFields.push([
          field.name,
          [
            this.resolveTypeName(field),
            // this.resolveTypeName(field),
            // this.resolveTypeName(field),
          ],
        ]);
      } else if (field.map) {
        const map = field;
        // mapFields.push([map.name, [map.keyType, this.resolveTypeName(map)]]);
        mapFields.push([
          map.name,
          [
            ["", this.resolveTypeName(map)],
            // ["", this.resolveTypeName(map)],
            // ["", this.resolveTypeName(map)],
          ],
        ]); // keytype always string
      } else {
        singleFields.push([field.name, this.resolveTypeName(field)]);
      }
    });

    const oneOfFieldNames = [];
    if (messageType.oneofs) {
      Object.values(messageType.oneofs).forEach((one) => {
        const options = one.oneof.map((el) => {
          let elt = messageType.fields[el];
          const typeName = this.resolveTypeName(elt);
          console.log("typeName ***", typeName)
          oneOfFieldNames.push(elt.name)
          return [elt.name, typeName];
        });
        oneOfFields.push([one.name, options.splice(1)]);
        // oneOfFields.splice(0, 1, [one.name, options]); // replace item
        console.log("oneOfFields ***", oneOfFields)
      });
    }

    console.log("**** 1", oneOfFields);

    // const oneOfFieldNames = oneOfFields.reduce(
    //   (acc, [, options]) => acc.concat(options.map(([name]) => name)),
    //   []
    // );

    console.log("**** 2", oneOfFieldNames);

    const realSingleFields = singleFields.filter(
      ([name]) => !oneOfFieldNames.includes(name)
    );
    oneOfFields = oneOfFields.filter((of, i) =>  i=== 0)
    oneOfFields.forEach((of) => {
      let temp = of[1];
      console.log("temp", temp)
        of[1] = [].concat.apply([], temp);
    });
    // oneOfFields.splice(0, 1, [one.name, options]); // replace item
   
    const temp = {
      type: {
        ...messageType,
        tag: "message",
        name: messageType.fullName,
      },
      singleFields: [...realSingleFields],
      repeatedFields: [...repeatedFields],
      oneOfFields: [...oneOfFields],
      mapFields: [...mapFields],
    };

    // const currentNode = {
    //   type: messageType,
    //   ...temp
    // }

    return temp;
  };

  createEnumType(enumType) {
    const temp = {
      tag: "enum",
      name: enumType.fullName,
      options: Object.keys(enumType.values),
      optionValues: enumType.values,
    };
    return temp;
  }

  updateCurrentNode = (fieldName, type, value, field) => {
    console.log(fieldName, type, value, field);
    switch (type) {
      case "SingleField":
        this.updateSingleField(fieldName, value, field);
        break;
      case "RepeatedField":
        this.updateRepeatedField(fieldName, value, field);
        break;
      case "OneOfField":
        this.updateOneOfField(fieldName, value, field);
        break;
      case "MapField":
        this.updateMapField(fieldName, value, field);
        break;
    }
  };

  addEntry = (fieldName, type, field) => {
    console.log(fieldName, type, field);
    switch (type) {
      case "RepeatedField":
        this.addRepeatedField(fieldName, field);
        break;
      case "MapField":
        this.addMapField(fieldName, field);
        break;
    }
  };

  removeEntry = (fieldName, type, currentField) => {
    console.log(fieldName, type);
    // switch (type) {
    //   case "RepeatedField":
    //     this.removeRepeatedField(fieldName);
    //     break;
    //   case "MapField":
    //     this.removeMapField(fieldName);
    //     break;
    // }
    // ***** currentField = {values, idx} ****
    currentField.values.splice(currentField.idx, 1);
    this.setState({
      currentNode: {
        ...this.state.currentNode,
      },
    });
  };

  addRepeatedField = (fieldName, currentField) => {
    // console.log("RepeatedField", this.state.currentNode.repeatedFields);
    // let repeatedFields = cloneDeep(this.state.currentNode.repeatedFields);

    // const repeatedFieldsUpdated = repeatedFields.map((currentField) => {
    //   if (currentField[0] === fieldName[0]) {
    //     const field = this.state.currentNode.type.fields[fieldName[0]];
    //     currentField[1].push(this.resolveTypeName(field));
    //   }
    //   return currentField;
    // });

    // this.setState({
    //   currentNode: {
    //     ...this.state.currentNode,
    //     repeatedFields: repeatedFieldsUpdated,
    //   },
    // });

    const field = this.state.currentNode.type.fields[currentField[0]];
    currentField[1].push(this.resolveTypeName(field));
    this.setState({
      currentNode: {
        ...this.state.currentNode,
      },
    });
  };

  // removeRepeatedField = (fieldName) => {
  //   console.log("RepeatedField", this.state.currentNode.repeatedFields);
  //   let repeatedFields = cloneDeep(this.state.currentNode.repeatedFields);

  //   const repeatedFieldsUpdated = repeatedFields.map((currentField) => {
  //     if (currentField[0] === fieldName[0]) {
  //       currentField[1].splice(+fieldName[1], 1);
  //     }
  //     return currentField;
  //   });

  //   this.setState({
  //     currentNode: {
  //       ...this.state.currentNode,
  //       repeatedFields: repeatedFieldsUpdated,
  //     },
  //   });
  // };

  addMapField = (fieldName, currentField) => {
    // console.log("MapField", this.state.currentNode.mapFields);
    // let mapFields = cloneDeep(this.state.currentNode.mapFields);
    // // let currentField = mapFields.find((sf) => sf[0] === fieldName[0]);
    // const mapFieldsUpdated = mapFields.map((currentField) => {
    //   if (currentField[0] === fieldName[0]) {
    //     const field = this.state.currentNode.type.fields[fieldName[0]];
    //     currentField[1].push(["", this.resolveTypeName(field)]); // keytype always string
    //   }
    //   return currentField;
    // });
    // this.setState({
    //   currentNode: {
    //     ...this.state.currentNode,
    //     mapFields: mapFieldsUpdated,
    //   },
    // });

    const field = this.state.currentNode.type.fields[currentField[0]];
    currentField[1].push(["", this.resolveTypeName(field)]); // keytype always string
    this.setState({
      currentNode: {
        ...this.state.currentNode,
      },
    });
  };

  // removeMapField = (fieldName) => {
  //   console.log("MapField", this.state.currentNode.mapFields);
  //   let mapFields = cloneDeep(this.state.currentNode.mapFields);
  //   // let currentField = mapFields.find((sf) => sf[0] === fieldName[0]);
  //   const mapFieldsUpdated = mapFields.map((currentField) => {
  //     if (currentField[0] === fieldName[0]) {
  //       currentField[1].splice(+fieldName[1], 1);
  //     }
  //     return currentField;
  //   });

  //   this.setState({
  //     currentNode: {
  //       ...this.state.currentNode,
  //       mapFields: mapFieldsUpdated,
  //     },
  //   });
  // };

  updateSingleField(fieldName, value, currentField) {
    // console.log("singleFields", this.state.currentNode.singleFields);
    // let singleFields = cloneDeep(this.state.currentNode.singleFields);
    // let currentField = singleFields.find((sf) => sf[0] === fieldName[0]);
    // // if(currentField[1].type.tag === "primitive") {
    // currentField[1].value = value;
    // // }
    // if (currentField[1].type.tag === "enum") {
    //   currentField[1].selected = value;
    // }
    // this.setState({
    //   currentNode: { ...this.state.currentNode, singleFields: singleFields },
    // });
    // console.log("currentField", currentField, singleFields);
    currentField.value = value;
    if (currentField.type.tag === "enum") {
      currentField.selected = value;
    }
    this.setState({
      currentNode: { ...this.state.currentNode },
    });
  }

  updateRepeatedField(fieldName, value, currentField) {
    // console.log("RepeatedField", this.state.currentNode.repeatedFields);
    // let repeatedFields = cloneDeep(this.state.currentNode.repeatedFields);
    // let currentField = repeatedFields.find((sf) => sf[0] === fieldName[0]);
    // currentField[1][+fieldName[1]].value = value;
    // if (currentField[1][+fieldName[1]].type.tag === "enum") {
    //   currentField[1][+fieldName[1]].selected = value;
    // }
    // this.setState({
    //   currentNode: {
    //     ...this.state.currentNode,
    //     repeatedFields: repeatedFields,
    //   },
    // });
    currentField.value = value;
    if (currentField.type.tag === "enum") {
      currentField.selected = value;
    }
    this.setState({
      currentNode: { ...this.state.currentNode },
    });
  }

  updateOneOfField(fieldName, value) {
    console.log("OneOfField", this.state.currentNode.oneOfFields);
    let oneOfFields = cloneDeep(this.state.currentNode.oneOfFields);
    oneOfFields.map((of) => {
      if (of[0] === fieldName[0]) {
        let temp = of[1];
        if (temp[0] === fieldName[1]) {
          console.log("FV", temp[1]);
          temp[1].value = value;
        }
      }
      return of;
    });

    // currentField[1].value = value;
    // currentField[1].selected = value;
    this.setState({
      currentNode: { ...this.state.currentNode, oneOfFields: oneOfFields },
    });
    // console.log("currentField", currentField, oneOfFields, fieldName);
  }

  updateMapField(fieldName, value, currentField) {
    // console.log("MapField", this.state.currentNode.mapFields);
    // let mapFields = cloneDeep(this.state.currentNode.mapFields);
    // let currentField = mapFields.find((sf) => sf[0] === fieldName[0]);
    // let type = currentField[1][+fieldName[1]];
    // console.log("TYPE", type);
    // if (+fieldName[2] === 0) {
    //   type[0] = value;
    // } else {
    //   type[1].value = value;
    //   if (type[1].type.tag === "enum") {
    //     type[1].selected = value;
    //   }
    // }
    // this.setState({
    //   currentNode: { ...this.state.currentNode, mapFields: mapFields },
    // });

    if (isArray(currentField)) {
      // means key change
      currentField[0] = value;
    } else {
      // means value change
      currentField.value = value;
      if (currentField.type.tag === "enum") {
        currentField.selected = value;
      }
    }
    this.setState({
      currentNode: { ...this.state.currentNode },
    });
  }

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

  resolveTypeName = (resolvedField) => {
    console.log("resolvedField", resolvedField);
    if (
      resolvedField.type &&
      allPrimitiveTypes.includes(resolvedField.type.value)
    ) {
      // return resolvedField.resolvedType?.fullName || resolvedField.type;
      return {
        type: {
          // ...resolvedField.type,
          tag: "primitive",
          name: resolvedField.type.value,
          defaultValue: "",
          field: resolvedField,
        },
        value: "",
      };
    } else {
      let key = this.convertToDollarKey(resolvedField.type.resolvedValue);
      let referencedType = this.typeMap()[key];
      console.log("referencedType", referencedType);
      if (referencedType.syntaxType === "MessageDefinition") {
        console.log("MEESAGE");
        return this.createMessage(referencedType);
      }
      if (referencedType.syntaxType === "EnumDefinition") {
        const enumType = this.createEnumType(referencedType);
        return {
          type: enumType,
          selected: enumType.options[0],
          value: enumType.options[0],
        };
      }
    }
  };

  setMessages = (currentMessage, message) => {
    this.setState({
      currentMessage: currentMessage,
      // currentNode: {
      //   type: currentMessage,
      //   repeatedFields: message.repeatedFields || [],
      //   oneOfFields: message.oneOfFields || [],
      //   singleFields: message.singleFields || [],
      //   mapFields: message.mapFields || [],
      // },

      currentNode: message,
    });
  };

  handleChange = (messageName) => {
    // const currentMessage = event.target.value;
    // console.log(currentMessage);
    // this.setState({
    //   currentMessage: this.props.messages[message],
    // });
    // // this.parseNode(this.props.messages[message]);
    // let test = this.createMessageType(this.props.messages[message]);
    // console.log("TEST", test);
    let message = this.createMessage(this.props.messages[messageName]);
    this.setMessages(this.props.messages[messageName], message);
  };

  handleSave = () => {
    console.log(this.state.currentNode);
    let jsonObj = {};
    this.getMessageValue({ ...this.state.currentNode }, jsonObj);
    console.log("JSON OBJ", jsonObj);
  };

  getMessageValue = (value, jsonObj) => {
    const {
      type,
      singleFields,
      repeatedFields,
      oneOfFields,
      mapFields,
    } = value;

    singleFields.map(([fieldName, value]) => {
      jsonObj[fieldName] = this.getFieldValue(value);
    });

    repeatedFields.map(([fieldName, values]) => {
      jsonObj[fieldName] = values.map((v, idx) => {
        return this.getFieldValue(v);
      });
    });

    mapFields.map(([fieldName, entries]) => {
      jsonObj[fieldName] = jsonObj[fieldName] || {};
      entries.forEach(([k, v], idx) => {
        jsonObj[fieldName][k.replace(/ /g, "_")] = this.getFieldValue(v);
      });
    });

    oneOfFields.map(([fieldName, value]) => {
      jsonObj[fieldName] = jsonObj[fieldName] || {};
      const [name, val] = value;
      jsonObj[fieldName][name] = val.value;
    });
  };

  getFieldValue = (value, obj={}) => {
    console.log("TYPE", value)
    switch (value.type.tag) {
      case "message":
        this.getMessageValue(value, obj);
        return obj;
      case "primitive":
        return value.value;
      case "enum":
        return value.selected;
    }
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
                {this.state.currentMessage && (
                  <div
                    className="form-group"
                    id="input-group-message"
                    label="Message: "
                  >
                    <select
                      className="form-control"
                      value={this.state.currentMessage.name}
                      onChange={(e) => this.handleChange(e.target.value)}
                      id="input-message"
                    >
                      {this.state.messageList
                        .filter((ml) => ml.syntaxType === "MessageDefinition")
                        .map((list, i) => (
                          <option key={i} value={list.name}>
                            {list.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="col-6">
                <button className="btn btn-primary" onClick={this.handleSave}>
                  Save
                </button>
              </div>
            </div>

            <hr />
          </div>

          <hr />
          {/* {currentNode && <BodyInput node={currentNode} />} */}
          <div className="container">
            {currentNode && (
              <MessageValueView
                editable={true}
                value={currentNode}
                handlers={{
                  valueChange: this.valueChange,
                  fieldChange: this.fieldChange,
                  entryAdd: this.entryAdd,
                  entryRemove: this.entryRemove,
                }}
                prefix=""
              />
            )}
          </div>
        </div>
      </>
    );
  }
}

export default RenderFields;
