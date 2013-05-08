try{VaDashboard = VaDashboard;}catch(err){VaDashboard = {};}
VaDashboard.events = VaDashboard.events !== undefined ? VaDashboard.events : _.extend({}, Backbone.Events);
VaDashboard.templates = VaDashboard.templates !== undefined ? VaDashboard.templates : {};
VaDashboard.templates.details = {};
VaDashboard.templates.details['pending-claim'] = '<%= value %> veterans waiting for a response from the VA for compensation for a disease, injury or illness linked to service in the military on <%= date %>';
VaDashboard.templates.details['appealed-claims'] = 'Veterans who file an appeal to their claim wait <%= value %> days on average for a response from the VA if they were denied their original claim and had to appeal as of <%= date %>';
VaDashboard.templates.details['average-processing-time'] = 'Veterans wait <%= value %> days on average as of <%= date %> for a response to their disability claim';
VaDashboard.templates.details['average-days-pending'] = 'A claim has been in the VA system for <%= value %> days on average as of <%= date %>';
VaDashboard.templates.details['completed-claims'] = '<%= value %> claims processed per month as of <%= date %>';
VaDashboard.templates.details['claims-completed-per-fte'] = 'On average, claims processors complete <%= value %> claims per year as of <%= date %>';
VaDashboard.templates.details['employees-on-duty'] = '<%= value %> claims staff working the veterans service center as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-one-year'] = '<%= value %> unprocessed claims at least one year old as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-two-years'] = '<%= value %> unprocessed claims at least two years old as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-three-years'] = '<%= value %> unprocessed claims at least three years old as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-four-years'] = '<%= value %> unprocessed claims at least four years old as of <%= date %>';
VaDashboard.templates.details['claims-pending-at-least-five-years'] = '<%= value %> unprocessed claims at least five years old as of <%= date %>';
VaDashboard.templates.details['claims-received'] = '<%= value %> claims received by the VA per month as of <%= date %>';
VaDashboard.templates.details['claims-received-average-wait'] = 'Veterans filing a claim for the first time wait an average of <%= value %> days as of <%= date %>';
VaDashboard.templates.details['claims-pending-125-days'] = '<%= value %> unprocessed claims at least 125 days old as of <%= date %>';

var VaData = Backbone.Model.extend({
    initialize: function(attributes){
        this.attributes = attributes;
        //if you wanna do something when a data point is found
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
    parse: function(response) {
        return response.objects;
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
