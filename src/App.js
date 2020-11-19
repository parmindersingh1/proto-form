import "./App.css";

import { Component } from "react";
import FileInput from "./components/FileInput";
import RenderFields from "./components/RenderFields";
import Renderer from "./components/Renderer";

class App extends Component {
  state = {
    modes: {
      LOAD: "load",
      RENDER: "render",
    },
    currentMode: "load",
    protoPackage: "",
    protoMessages: [],
  };
  
  handleOnChange = (protoMsg) => {
    console.log("protoMsg", protoMsg);
    this.setState({
      protoMessages: protoMsg.root.nested,
      currentMode: this.state.modes.RENDER,
    });
  };

  render() {
    const { currentMode, modes, protoMessages } = this.state;
    return (
      <div className="App">
        <FileInput handleOnChange={this.handleOnChange} />
        {currentMode !== modes.LOAD && (
          <RenderFields messages={protoMessages} />
          // <Renderer messages={protoMessages} />
        )}
      </div>
    );
  }
}

export default App;
