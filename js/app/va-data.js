try{VaDashboard = VaDashboard;}catch(err){VaDashboard = {};}
VaDashboard.events = VaDashboard.events !== undefined ? VaDashboard.events : _.extend({}, Backbone.Events);
VaDashboard.templates = VaDashboard.templates !== undefined ? VaDashboard.templates : {};

var VaData = Backbone.Model.extend({
    initialize: function(attributes){
        this.attributes = attributes;
        //if you wanna do something when a data point is found
        //listen to this event
        VaDashboard.events.trigger('dataPointCreated', {model: this});
    },
    url: function(){
        return this.attributes.resource_uri;
    }
});
var VaDataCollection = Backbone.Collection.extend({
    model: VaData,
    initialize: function(models, options){
        this.fieldType = options.fieldType;
        this.resourceUri = options.resourceUri;
    },
    sync: function(method, model, options) {
        //jsonp to call from other domains
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            url: model.url(),
            processData: true
        }, options);
        return $.ajax(params);
    },
    parse: function(response) {
        return response.objects;
    },
    url: function(){
        return this.resourceUri;
    }
});