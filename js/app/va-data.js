try{VaDashboard = VaDashboard;}catch(err){VaDashboard = {};}
VaDashboard.events = VaDashboard.events !== undefined ? VaDashboard.events : _.extend({}, Backbone.Events);
VaDashboard.templates = VaDashboard.templates !== undefined ? VaDashboard.templates : {};
VaDashboard.templates.details = {};
VaDashboard.templates.details['pending-claim'] = '<%= value %> claims pending on <%= date %>';
VaDashboard.templates.details['appealed-claims'] = 'Veterans who file an appeal to their claim wait <%= value %> days on average as of <%= date %>';
VaDashboard.templates.details['average-processing-time'] = 'Veterans wait <%= value %> days on average as of <%= date %> for a response to their disability claim';
VaDashboard.templates.details['completed-claims'] = '<%= value %> claims were completed as of <%= date %>';
VaDashboard.templates.details['claims-completed-per-fte'] = 'On average, claims processors complete <%= value %> claims as of <%= date %>';
VaDashboard.templates.details['employees-on-duty'] = '<%= value %> employees on duty as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-one-year'] = '<%= value %> claims are pending at least one year as of <%= date %>';
VaDashboard.templates.details['claims-received'] = '<%= value %> claims were completed as of <%= date %>';
VaDashboard.templates.details['claims-received-average-wait'] = 'Veterans filing new claims wait an average of <%= value %> days as of <%= date %>';

var VaData = Backbone.Model.extend({
    initialize: function(attributes){
        this.attributes = attributes;
        //if you wanna do something when a data point is found
        //listen to this event
        VaDashboard.events.trigger('dataPointCreated', {model: this});
    },
    url: function(){
        return this.attributes.resource_uri;
    },
    getDetailTemplate: function(dateFormat, valueFormat){
        if(this.template === undefined)
            this.template = _.template(VaDashboard.templates.details[this.get('field_type_slug')]);
        var data = {
            date: dateFormat(new Date(this.get('date'))),
            value: valueFormat(this.get('value'))
        };
        return this.template(data);
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
            dataType: 'json',
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
var parseCSV = function(response){
    var lines = response.split('\n');
    var keys = lines[0].split(",");
    var content = lines.slice(1);
    var objects = _.map(content, function(obj){
        var object = {};
        obj = obj.replace("\"", "");
        var lineItems = obj.split(",");
        _.each(keys, function(key, idx, list){
            object[key] = lineItems[idx];
        });
        return obj === "" ? null : object;
    });
    var retval =  _.filter(objects, function(obj){
        return (obj !== null) === true;
    });
    return retval;
};
var sync = function(method, model, options, url){
    var me = this;
    var params = _.extend({
        type: 'GET',
        url: url
    }, options);
    return $.ajax(params);
};
var VaCSVDataCollection = Backbone.Collection.extend({
    model: VaData,
    initialize: function(models, options){
        this.fieldTypeSlug = options.fieldTypeSlug;
        this.citySlug = options.citySlug;
    },
    sync: function(method, model, options) {
        return sync(method, model, options, this.url());
    },
    parse: function(response) {
        return parseCSV(response);
    },
    url: function(){
        return "http://vbl-staging-media.s3.amazonaws.com/data/" + this.citySlug + "-" + this.fieldTypeSlug + ".csv";
    }
});
var VaCSVCitiesCollection = Backbone.Collection.extend({
    model: VaData,
    initialize: function(models, options){
    },
    sync: function(method, model, options) {
        return sync(method, model, options, this.url());
    },
    parse: function(response) {
        return parseCSV(response);
    },
    url: function(){
        return "http://vbl-staging-media.s3.amazonaws.com/data/cities.csv";
    }
});