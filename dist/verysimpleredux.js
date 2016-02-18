(function(globalContext) {

  globalContext.VerySimpleRedux = {
    createStore : function(reducer) {
      return new VerySimpleReduxStore(reducer);
    }
  };

  var VerySimpleReduxStore = function(reducer) {
    this.reducer = reducer;
    this.listeners = [];
    this.state = reducer(undefined, {});
  };
  VerySimpleReduxStore.prototype.dispatch = function(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(function(callback) {
      callback();
    });
  };
  VerySimpleReduxStore.prototype.subscribe = function(callback) {
    this.listeners.push(callback);
  };
  VerySimpleReduxStore.prototype.getState = function() {
    return this.state;
  };
  
}(window));

