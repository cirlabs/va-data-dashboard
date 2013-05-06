#Welcome!

The Center for Investigative Reporting has led the nation's coverage on the extent and impact of the (veterans disability backlog)[http://cironline.org/veterans]. We've accumulated 36,600 rows of data pertaining to 58 regional offices across the country from internal and publicly accessible Department of Veterans' Affairs documents. Now, we're releasing this data through an API.

#How to get the data

There are a few ways you can get ahold of the data:

1. Directly accessing the API (see more about how to do this in in the URLs, Schema section). This data is availble in JSON and JSONP.
```
curl http://vetsapi.herokuapp.com/api/data/?format=json
```
2. Download the spreadsheets hostd on Amazon s3
```
http://vbl-staging-media.s3.amazonaws.com/data/[CITY]-[FIELD-TYPE].csv
```
3. Use our code to create your own apps. We've created [a few Backbone.js collections and models](https://github.com/cirlabs/va-data-dashboard/blob/master/js/app/va-data.js) that you can use. An example can be found [here](https://github.com/cirlabs/va-data-dashboard)

#URLs and Schema

The data is organized as three different models: A time-series data model, a city model (technically a regional office, more later) representing the location of the data model, and field type model to differentiate between the different data types.

The exact fields follow:

```
class FieldType(models.Model):
    name = models.CharField(max_length=255)
    aspire_title = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from=('name',))
```
url = http://vetsapi.herokuapp.com/api/field-type/


```
class TimeSeriesData(models.Model):
    city = models.ForeignKey('collector.City')
    field_type = models.ForeignKey('collector.FieldType')
    value = models.FloatField()
    date = models.DateField()
    created = models.DateTimeField()
```
url = http://vetsapi.herokuapp.com/api/data/


```
class City(models.Model):
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from=('name',))
```
url = http://vetsapi.herokuapp.com/api/city/

#Field types

There are 14 different types of fields in our database:

```
                name                 |                slug                 
-------------------------------------+-------------------------------------
 Completed Claims                    | completed-claims
 Average Processing Time             | average-processing-time
 Appealed Claims                     | appealed-claims
 Claims Completed per FTE            | claims-completed-per-fte
 Employees on duty                   | employees-on-duty
 Claims pending at least one year    | claims-pending-at-least-one-year
 Claims received                     | claims-received
 Claims received average wait        | claims-received-average-wait
 Pending Claim                       | pending-claim
 Claims pending at least two years   | claims-pending-at-least-two-years
 Claims pending at least three years | claims-pending-at-least-three-years
 Claims pending at least four years  | claims-pending-at-least-four-years
 Claims pending at least five years  | claims-pending-at-least-five-years
 Claims Pending >= 125 Days          | claims-pending-125-days
```

#Querying the API and examples

Note: we use Tastypie to expose our data sets. This tutorial is brief and you can find more information about querying the data in [Tastypie's documentation](http://django-tastypie.readthedocs.org/en/latest/interacting.html#getting-a-collection-of-resources).

Accessing any of the above URLs will return a paginated list of data. Those lists can be filtered by adding parameters to the end of the url. For instance, maybe you'd like to see data points concerning the average time a veteran waits for a response from the VA, in your console type:

```
curl 'http://vetsapi.herokuapp.com/api/data/?format=json&field_type__slug=average-processing-time'
```

Which will return the 20 most recent average processing time data points. To get the next 20 items issue the following command:

```
curl 'http://vetsapi.herokuapp.com/api/data/?format=json&field_type__slug=average-processing-time&offset=20'
```

Or maybe you'd like see the average processing time for the regional office (city) in Portland, OR:

```
curl 'http://vetsapi.herokuapp.com/api/data/?format=json&field_type__slug=average-processing-time&city__slug=portland'
```

You can programatically access the API as follows:

Python using the requests library and simplejson
```
import requests
import simplejson

response = requests.get('http://vetsapi.herokuapp.com/api/city/')
cities = simplejson.loads(response.content)
for city in cities['objects']:
    response = requests.get('http://vetsapi.herokuapp.com/api/data/?city__slug=%s' % city['slug'])
    data = simplejson.loads(response.content)
    print data
```

#CSV data


