(function (win) {

  win.DoCourseScreen = React.createClass({
    displayName: "DoCourseScreen",

    getTestType: function () {
      var testTypes = [];
      win.Constants.testTypes.forEach(function (testType) {
        if (this.props.course[testType]) {
          testTypes.push(testType);
        }
      }, this);
      var index = Math.floor(Math.random() * testTypes.length);
      return testTypes[index];
    },
    getEntry: function (entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success || entries[key].attempt_success < this.props.course.test_ok_success_count || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return { id: 0 };
    },
    getAnswerEntryIds: function (id, entries) {
      var i, index;
      var answerEntryIds = [];
      var ids = Object.keys(entries);
      ids.splice(ids.indexOf(id.toString()), 1);
      for (i = 0; i < 3; i++) {
        index = Math.floor(Math.random() * ids.length);
        answerEntryIds.push(ids[index]);
        ids.splice(index, 1);
      }
      var insertIndex = Math.floor(Math.random() * answerEntryIds.length + 1);
      answerEntryIds.splice(insertIndex, 0, id);
      return answerEntryIds;
    },
    getNewTest: function () {
      var entry = this.getEntry(this.props.entries);
      return Object.assign({
        answerEntryId: 0,
        entryId: entry.id,
        answerEntryIds: this.getAnswerEntryIds(entry.id, this.props.entries),
        testType: this.getTestType()
      }, entry);
    },
    getInitialState: function () {
      return { answer: "", showMore: false };
    },
    componentDidMount: function () {
      // Force a rerender with first set of random item + possible answers.
      this.dispatchNewItem();
    },
    componentWillReceiveProps: function (nextProps) {
      this.setState({ answer: nextProps.answer || "", showMore: false });
    },
    getSuccess: function (entry) {
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      switch (this.props.doCourseTestType) {
        case "SOURCE_DESTINATION_CHOOSE":
          return entry.destination == doCourseEntry.destination;
        case "DESTINATION_SOURCE_CHOOSE":
          return entry.source == doCourseEntry.source;
        case "SOURCE_DESTINATION_WRITE":
          return this.state.answer == doCourseEntry.destination;
        case "DESTINATION_SOURCE_WRITE":
          return this.state.answer == doCourseEntry.source;
          break;
      }
      return null;
    },
    onChange: function (e) {
      this.setState({ answer: e.target.value });
    },
    onBack: function () {
      this.props.store.dispatch({
        type: "SELECT_COURSE",
        value: this.props.course.id
      });
    },
    dispatchNewItem: function () {
      this.props.store.dispatch(Object.assign(this.getNewTest(), { type: "DO_COURSE_NEW_RANDOM_ITEM" }));
    },
    onReset: function () {
      var ids = Object.keys(this.props.entries);
      var newEntryId = ids[Math.floor(Math.random() * ids.length)];
      var entryIds = this.getAnswerEntryIds(newEntryId, this.props.entries);
      var testType = this.getTestType();
      this.props.store.dispatch({
        type: "REQUEST_RESET",
        entryId: newEntryId,
        entryIds: entryIds,
        testType: testType
      });
    },
    onSave: function () {
      var success = this.getSuccess();
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        answer: this.state.answer,
        doCourseSuccess: success
      });
    },
    answerClick: function (e) {
      var id = e.currentTarget.dataset.id;
      var answerEntry = this.props.entries[id];
      var success = this.getSuccess(answerEntry);
      this.props.store.dispatch({
        type: "REQUEST_SAVE_ANSWER",
        answerEntryId: id,
        doCourseSuccess: success
      });
    },
    onWriteKeyDown: function (e) {
      switch (e.keyCode) {
        case 13:
          // ENTER
          e.preventDefault();
          if (this.state.answer.length) {
            this.onSave();
          }
          break;
      }
    },
    showWrite: function () {
      var me = this;
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      var key = this.props.doCourseTestType == "SOURCE_DESTINATION_WRITE" ? "source" : "destination";
      var otherKey = key == "source" ? "destination" : "source";
      var cName = "";
      if (this.props.doCourseSuccess === true) {
        cName = "success";
      } else if (this.props.doCourseSuccess === false) {
        cName = "wrong";
      }
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "span",
            { className: "doCourseQuestionTitleSource" },
            this.props.course[key + "_title"],
            ":"
          ),
          React.createElement(
            "span",
            null,
            React.createElement(
              "strong",
              null,
              doCourseEntry[key]
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement("input", { className: cName,
            placeholder: this.props.course[otherKey + "_title"],
            type: "text",
            readOnly: me.props.doCourseSuccess !== null,
            onKeyDown: this.onWriteKeyDown,
            ref: function (el) {
              if (el && me.props.doCourseSuccess === null) {
                el.focus();
              }
            },
            onChange: this.onChange, value: this.state.answer })
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "button",
            { className: "fullwidthButton", disabled: this.state.answer.length == 0 || this.props.doCourseSuccess !== null, onClick: this.onSave },
            "Save"
          )
        ),
        React.createElement(
          "div",
          { id: "bottombar", className: "row floatright" },
          React.createElement(
            "button",
            { disabled: this.props.doCourseSuccess === null,
              ref: function (el) {
                if (el && me.props.doCourseSuccess !== null) {
                  el.focus();
                }
              },
              onClick: this.dispatchNewItem },
            "Next"
          )
        )
      );
    },
    showOptions: function () {
      var me = this;
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      var key = this.props.doCourseTestType == "SOURCE_DESTINATION_CHOOSE" ? "source" : "destination";
      var otherKey = key == "source" ? "destination" : "source";
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "span",
            { className: "doCourseQuestionTitleSource" },
            this.props.course[key + "_title"],
            ":"
          ),
          React.createElement(
            "span",
            null,
            React.createElement(
              "strong",
              null,
              doCourseEntry[key]
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "doCourseQuestionTitle" },
            this.props.course[otherKey + "_title"],
            "?"
          )
        ),
        React.createElement(
          "div",
          { className: "row", id: "answerOptionWrapper" },
          this.props.doCourseAnswerEntryIds.map(function (entryId, index) {
            var cName = "";
            var text = [React.createElement(
              "span",
              { key: entryId + "other" },
              this.props.entries[entryId][otherKey]
            )];
            if (this.props.entries[entryId].phone) {
              text.push(React.createElement(
                "span",
                { className: "phone", key: entryId + "phone" },
                this.props.entries[entryId].phone
              ));
            }
            if (this.props.answerEntryId) {
              if (this.props.answerEntryId == entryId) {
                cName = this.props.doCourseSuccess ? "success" : "wrong";
              }
            }
            return React.createElement(
              "button",
              { className: cName,
                ref: function (el) {
                  if (el && index == 0 && me.props.doCourseSuccess === null) {
                    el.focus();
                  }
                },
                disabled: this.props.doCourseSuccess !== null,
                key: entryId, "data-id": entryId,
                onClick: this.answerClick },
              text
            );
          }, this)
        ),
        React.createElement(
          "div",
          { id: "bottombar", className: "row floatright" },
          React.createElement(
            "button",
            {
              ref: function (el) {
                if (el && me.props.doCourseSuccess !== null) {
                  el.focus();
                }
              },
              className: "normalButton",
              disabled: this.props.doCourseSuccess === null,
              onClick: this.dispatchNewItem },
            "Next"
          )
        )
      );
    },
    onMore: function () {
      this.setState({
        showMore: !this.state.showMore
      });
    },
    render: function () {
      var editArea = null;
      if (this.props.doCourseEntryId) {
        var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
        switch (this.props.doCourseTestType) {
          case "SOURCE_DESTINATION_CHOOSE":
          case "DESTINATION_SOURCE_CHOOSE":
            editArea = this.showOptions();
            break;
          case "SOURCE_DESTINATION_WRITE":
          case "DESTINATION_SOURCE_WRITE":
            editArea = this.showWrite();
            break;
        }
      } else {
        editArea = React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "formRow" },
            React.createElement(
              "p",
              null,
              React.createElement(
                "strong",
                null,
                "Course finished!"
              )
            ),
            React.createElement(
              "p",
              null,
              "Good answers: ",
              this.props.course.count_attempt_success
            ),
            React.createElement(
              "p",
              null,
              "Wrong answers: ",
              this.props.course.count_attempt_failure
            )
          ),
          React.createElement(
            "div",
            { className: "formRow" },
            React.createElement(
              "p",
              null,
              React.createElement(
                "button",
                { className: "deleteButton", onClick: this.onReset },
                "Reset"
              )
            )
          )
        );
      }
      return React.createElement(
        "div",
        { id: "screen" },
        React.createElement(
          "div",
          { id: "navbar" },
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarLeft" },
            React.createElement(
              "button",
              { onClick: this.onBack },
              "<"
            )
          ),
          React.createElement(
            "div",
            { id: "navbarTitle" },
            "Test"
          ),
          React.createElement(
            "div",
            { className: "navbarButtonContainer", id: "navbarRight" },
            React.createElement(
              "button",
              { onClick: this.onMore },
              ":"
            )
          )
        ),
        React.createElement(
          "div",
          { id: "main" },
          editArea,
          this.state.showMore ? React.createElement(
            "ul",
            { id: "popup", className: "listView" },
            React.createElement(
              "li",
              null,
              React.createElement(
                "a",
                { onClick: this.onReset },
                "Reset"
              )
            )
          ) : ""
        )
      );
    }
  });
})(window);