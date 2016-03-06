(function (win) {

  var testTypes = ["SRC_DEST_CHOOSE", "DEST_SRC_CHOOSE", "SRC_DEST_WRITE", "DEST_SRC_WRITE"];

  win.DoCourseScreen = React.createClass({
    displayName: "DoCourseScreen",

    getTestType: function () {
      var index = Math.floor(Math.random() * testTypes.length);
      return testTypes[index];
    },
    getEntry: function (entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return { id: 0 };
    },
    getAnswerEntries: function (id, entries) {
      var i, index;
      var answerEntries = [];
      var ids = Object.keys(entries);
      ids.splice(ids.indexOf(id.toString()), 1);
      for (i = 0; i < 3; i++) {
        index = Math.floor(Math.random() * ids.length);
        answerEntries.push(entries[ids[index]]);
        ids.splice(index, 1);
      }
      var insertIndex = Math.floor(Math.random() * answerEntries.length + 1);
      answerEntries.splice(insertIndex, 0, entries[id]);
      return answerEntries;
    },
    getInitialState: function () {
      var entry = this.getEntry(this.props.entries);
      return Object.assign({
        answerEntry: null,
        answer: "",
        answerEntries: this.getAnswerEntries(entry.id, this.props.entries),
        testType: this.getTestType()
      }, entry);
    },
    componentWillReceiveProps: function (nextProps) {
      var entry = this.getEntry(nextProps.entries);
      this.setState(Object.assign({
        answerEntry: null,
        answer: "",
        answerEntries: this.getAnswerEntries(entry.id, nextProps.entries),
        testType: this.getTestType()
      }, entry));
    },
    onSave: function () {
      var entry = Object.assign({}, this.state);
      var success = this.getSuccess();
      delete entry.answer;
      delete entry.testType;
      delete entry.answerEntries;
      delete entry.answerEntry;
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        value: entry,
        success: success,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    getSuccess: function () {
      switch (this.state.testType) {
        case "SRC_DEST_CHOOSE":
          return this.state.answerEntry.dest == this.state.dest;
          break;
        case "DEST_SRC_CHOOSE":
          return this.state.answerEntry.src == this.state.src;
        case "SRC_DEST_WRITE":
          return this.state.answer == this.state.dest;
        case "DEST_SRC_WRITE":
          return this.state.answer == this.state.src;
          break;
      }
      return null;
    },
    onChange: function (e) {
      this.setState({ answer: e.target.value });
    },
    onBack: function () {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type: "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    onReset: function () {
      this.props.store.dispatch({
        type: "REQUEST_RESET",
        value: this.props.course.id,
        forceBackToMainScreen: this.props.forceBackToMainScreen
      });
    },
    answerClick: function (e) {
      var id = e.target.dataset.id;
      var entry = this.props.entries[id];
      this.setState({
        answerEntry: entry
      });
    },
    render: function () {
      if (this.state.id) {
        var editArea = null;
        switch (this.state.testType) {
          case "SRC_DEST_CHOOSE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "SRC: ",
                this.state.src
              ),
              React.createElement(
                "div",
                null,
                this.state.answerEntries.map(function (entry) {
                  var cName = "";
                  if (this.state.answerEntry) {
                    if (this.state.answerEntry.id == entry.id) {
                      cName = this.getSuccess() ? "success" : "wrong";
                    }
                  }
                  return React.createElement(
                    "button",
                    { className: cName, key: entry.id, "data-id": entry.id, onClick: this.answerClick },
                    entry.dest
                  );
                }, this)
              ),
              React.createElement(
                "button",
                { disabled: !!!this.state.answerEntry, onClick: this.onSave },
                "Next"
              )
            );
            break;
          case "DEST_SRC_CHOOSE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "DEST: ",
                this.state.dest
              ),
              React.createElement(
                "div",
                null,
                this.state.answerEntries.map(function (entry) {
                  var cName = "";
                  if (this.state.answerEntry) {
                    if (this.state.answerEntry.id == entry.id) {
                      cName = this.getSuccess() ? "success" : "wrong";
                    }
                  }
                  return React.createElement(
                    "button",
                    { className: cName, key: entry.id, "data-id": entry.id, onClick: this.answerClick },
                    entry.src
                  );
                }, this)
              ),
              React.createElement(
                "button",
                { disabled: !!!this.state.answerEntry, onClick: this.onSave },
                "Next"
              )
            );
            break;
          case "SRC_DEST_WRITE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "SRC: ",
                this.state.src
              ),
              React.createElement("input", { placeholder: "dest", autoFocus: true, type: "text",
                ref: function (el) {
                  if (el) {
                    el.focus();
                  }
                },
                onChange: this.onChange, value: this.state.answer }),
              React.createElement(
                "button",
                { onClick: this.onSave },
                "Next"
              )
            );
            break;
          case "DEST_SRC_WRITE":
            editArea = React.createElement(
              "div",
              null,
              React.createElement(
                "div",
                null,
                "DEST: ",
                this.state.dest
              ),
              React.createElement("input", { placeholder: "src", autoFocus: true, type: "text",
                ref: function (el) {
                  if (el) {
                    el.focus();
                  }
                },
                onChange: this.onChange, value: this.state.answer }),
              React.createElement(
                "button",
                { onClick: this.onSave },
                "Next"
              )
            );
            break;
        }
        return React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            this.props.course.title
          ),
          editArea,
          React.createElement(
            "button",
            { onClick: this.onBack },
            "Back"
          ),
          React.createElement(
            "button",
            {
              disabled: this.props.course.count_attempt_success == 0 && this.props.course.count_attempt_failure == 0,
              onClick: this.onReset },
            "Reset"
          )
        );
      } else {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            "Course finished!"
          ),
          React.createElement(
            "button",
            {
              disabled: this.props.course.count_attempt_success == 0 && this.props.course.count_attempt_failure == 0,
              onClick: this.onReset },
            "Reset"
          )
        );
      }
    }
  });
})(window);