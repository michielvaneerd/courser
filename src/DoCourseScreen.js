(function(win) {

  win.DoCourseScreen = React.createClass({
    getTestType : function() {
      var testTypes = [];
      win.Constants.testTypes.forEach(function(testType) {
        if (this.props.course[testType]) {
          testTypes.push(testType);
        }
      }, this);
      var index = Math.floor(Math.random() * testTypes.length);
      return testTypes[index];
    },
    getEntry : function(entries) {
      var ids = [];
      for (var key in entries) {
        if (!entries[key].attempt_success
          || entries[key].attempt_success < this.props.course.test_ok_success_count
          || entries[key].attempt_success < entries[key].attempt_failure) {
          ids.push(key);
        }
      }
      if (ids.length) {
        var index = Math.floor(Math.random() * ids.length);
        return entries[ids[index]];
      }
      return {id : 0};
    },
    getAnswerEntryIds : function(id, entries) {
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
    getNewTest : function() {
      var entry = this.getEntry(this.props.entries);
      return Object.assign({
        answerEntryId : 0,
        entryId : entry.id,
        answerEntryIds : this.getAnswerEntryIds(entry.id, this.props.entries),
        testType : this.getTestType()
      }, entry);
    },
    getInitialState : function() {
      return {answer : "", showMore : false};
    },
    componentDidMount : function() {
      // Force a rerender with first set of random item + possible answers.
      this.dispatchNewItem();
    },
    componentWillReceiveProps : function(nextProps) {
      this.setState({answer : nextProps.answer || "", showMore : false});
    },
    getSuccess : function(entry) {
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
    onChange : function(e) {
      this.setState({answer : e.target.value});
    },
    onBack : function() {
      if (!this.props.forceBackToMainScreen) {
        this.props.store.dispatch({
          type : "SHOW_COURSE_SCREEN"
        });
      } else {
        this.props.onMain();
      }
    },
    dispatchNewItem : function() {
      this.props.store.dispatch(Object.assign(
        this.getNewTest(),
        {type : "DO_COURSE_NEW_RANDOM_ITEM",
        forceBackToMainScreen : this.props.forceBackToMainScreen})
      );
    },
    onReset : function() {
      var ids = Object.keys(this.props.entries);
      var newEntryId = ids[Math.floor(Math.random() * ids.length)];
      var entryIds = this.getAnswerEntryIds(newEntryId, this.props.entries);
      var testType = this.getTestType();
      this.props.store.dispatch({
        type : "REQUEST_RESET",
        entryId : newEntryId,
        entryIds : entryIds,
        testType : testType,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onSave : function() {
      var success = this.getSuccess();
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ANSWER",
        answer : this.state.answer,
        doCourseSuccess : success,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    answerClick : function(e) {
      var id = e.target.dataset.id;
      var answerEntry = this.props.entries[id];
      var success = this.getSuccess(answerEntry);
      this.props.store.dispatch({
        type : "REQUEST_SAVE_ANSWER",
        answerEntryId : id,
        doCourseSuccess : success,
        forceBackToMainScreen : this.props.forceBackToMainScreen
      });
    },
    onWriteKeyDown : function(e) {
      switch (e.keyCode) {
        case 13: // ENTER
          e.preventDefault();
          if (this.state.answer.length) {
            this.onSave();
          }
        break;
      }
    },
    showWrite : function() {
      var me = this;
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      var key = this.props.doCourseTestType == "SOURCE_DESTINATION_WRITE"
        ? "source" : "destination";
      var otherKey = key == "source" ? "destination" : "source";
      var cName = "";
      if (this.props.doCourseSuccess === true) {
        cName = "success";
      } else if (this.props.doCourseSuccess === false) {
        cName = "wrong";
      }
      return (
        <div>
          <div className="doCourseQuestion">
            <span className="doCourseQuestionTitleSource">{this.props.course[key + "_title"]}</span>
            <span className="doCourseQuestionEntry">{doCourseEntry[key]}</span>
          </div>
          <div className="doCourseInput">
            <input className={cName}
              placeholder={this.props.course[otherKey + "_title"]}
              type="text"
              readOnly={me.props.doCourseSuccess !== null}
              onKeyDown={this.onWriteKeyDown}
              ref={function(el) {
                if (el && me.props.doCourseSuccess === null) {
                  el.focus();
                }
              }}
              onChange={this.onChange} value={this.state.answer} />
          </div>
          <div id="bottombar">
            <button disabled={this.props.doCourseSuccess === null}
              ref={function(el) {
                if (el && me.props.doCourseSuccess !== null) {
                  el.focus();
                }
              }}
              onClick={this.dispatchNewItem}>Next</button>
            <button disabled={this.state.answer.length == 0 || this.props.doCourseSuccess !== null} onClick={this.onSave}>Save</button>
          </div>
        </div>
      );
    },
    showOptions : function() {
      var me = this;
      var doCourseEntry = this.props.entries[this.props.doCourseEntryId];
      var key = this.props.doCourseTestType == "SOURCE_DESTINATION_CHOOSE"
        ? "source" : "destination";
      var otherKey = key == "source" ? "destination" : "source";
      return (
        <div>
          <div className="doCourseQuestion">
            <span className="doCourseQuestionTitleSource">{this.props.course[key + "_title"]}:</span>
            <span className="doCourseQuestionEntry">{doCourseEntry[key]}</span>
          </div>
          <div className="doCourseOptions">
            <div className="doCourseQuestionTitle">{this.props.course[otherKey + "_title"]}?</div>
            {this.props.doCourseAnswerEntryIds.map(function(entryId, index) {
              var cName = "";
              if (this.props.answerEntryId) {
                if (this.props.answerEntryId == entryId) {
                  cName = this.props.doCourseSuccess ? "success" : "wrong";
                }
              }
              return (
                <button className={cName}
                  ref={function(el) {
                    if (el && index == 0 && me.props.doCourseSuccess === null) {
                      el.focus();
                    }
                  }}
                  disabled={this.props.doCourseSuccess !== null}
                  key={entryId} data-id={entryId}
                  onClick={this.answerClick}>{this.props.entries[entryId][otherKey]}</button>
              );
            }, this)}
          </div>
          <div id="bottombar">
            <button
              ref={function(el) {
                if (el && me.props.doCourseSuccess !== null) {
                  el.focus();
                }
              }}
              disabled={this.props.doCourseSuccess === null}
              onClick={this.dispatchNewItem}>Next</button>
          </div>
        </div>
      );
    },
    onMore : function() {
      this.setState({
        showMore : !this.state.showMore
      });
    },
    render : function() {
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
        editArea = (
          <div>
            <div className="formRow">
              <p><strong>Course finished!</strong></p>
              <p>Good answers: {this.props.course.count_attempt_success}</p>
              <p>Wrong answers: {this.props.course.count_attempt_failure}</p>
            </div>
            <div className="formRow">
              <p><button className="deleteButton" onClick={this.onReset}>Reset</button></p>
            </div>
          </div>
        );
      }
      return (
        <div>
          <div id="navbar">
            <button id="backButton" onClick={this.onBack}>&lt;</button>
            <h2>Test</h2>
            <button id="moreButton" onClick={this.onMore}>:</button>
          </div>
          <div id="main">
          {editArea}
          {this.state.showMore ? (
            <ul id="popup">
              <li><button className="deleteButton" onClick={this.onReset}>Reset</button></li>
            </ul>
          ) : ""}
          </div>
        </div>
      );
    }
  });

}(window));