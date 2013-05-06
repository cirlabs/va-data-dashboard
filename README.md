#Welcome!

The Center for Investigative Reporting has led the nation's coverage on the extent and impact of the [veterans disability backlog](http://cironline.org/veterans). We've accumulated 36,600 rows of data pertaining to 58 regional offices across the country from internal and publicly accessible Department of Veterans' Affairs documents. Now, we're releasing this data through an API.

###Questions
If you still have questions after reading this, email devdata@cironline.org

#How to get the data

There are a few ways you can get ahold of the data:

1. Directly accessing the API (see more about how to do this in in the URLs and schema section). This data is availble in JSON and JSONP.
```
curl http://vetsapi.herokuapp.com/api/data/?format=json
```
2. Download the spreadsheets hosted on Amazon s3. See section on [CSV data](https://github.com/cirlabs/va-data-dashboard#csv-data)
```
http://vbl-staging-media.s3.amazonaws.com/data/[CITY-SLUG]-[FIELD-TYPE-SLUG].csv
```
3. Use our code to create your own apps. We've created [a few Backbone.js collections and models](https://github.com/cirlabs/va-data-dashboard/blob/master/js/app/va-data.js) that you can use. An example can be found [here](https://github.com/cirlabs/va-data-dashboard)

#URLs and schema

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
    '''
    NOTE: Cities represent regional offices
    Generally speaking, there is one regional office per state
    serving all veterans.
    This is not always the case. Large states like
    California and Texas have multiple regional offices.
    If you'd like to look up the regional office that serves your area
    go to: http://www2.va.gov/directory/guide/home.asp?isflash=1
    '''
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

For examples in Javascript, please see [index.html](https://github.com/cirlabs/va-data-dashboard/blob/master/index.html#L178)

#CSV data

While the API provides more flexible access to the data it can be slow. For more reliable, fast access to the data we baked all the data into CSV files and store them on S3. Access to the data is on a per city, per field type basis much like the api though the format differs slightly. For instance, to get a list of all cities go to the following url:

```
http://vbl-staging-media.s3.amazonaws.com/data/cities.csv
```

Now, all the spreadsheets are segmented by city for each of the 14 field types. Following the example above, if you wanted to view all data points by field type 'average processing time' for the regional office in Portland, OR., look at the following url:

```
http://vbl-staging-media.s3.amazonaws.com/data/portland-average-processing-time.csv
```

The downside to using CSV data is no aggregate file for all data points about 'average processing time', or any other field type. To obtain the entire data set for a given field type, iterate over the list of cities requesting each file for the given field type.

As noted, the url to access CSV documents follows this format:

```
http://vbl-staging-media.s3.amazonaws.com/data/[CITY-SLUG]-[FIELD-TYPE-SLUG].csv
```

#Links
http://www.vba.va.gov/REPORTS/mmwr/index.asp

http://www.app.hospitalcompare.va.gov/index.cfm?org=vha

http://cironline.org/veterans

http://cironline.org/reports/map-where-veterans-backlog-worst-3792

#Data notes

<ul>
    <li>Veterans Waiting on a Disability Claim: The number of veterans waiting for a response from the VA for compensation for a disease, injury or illness linked to service in the military. Nationally, this number also includes about 10,000 survivors and other family members seeking compensation related to service-related injuries and diseases.</li>
    <li>Average processing time: The average number of days a veteran waits for a decision from the VA.</li>
    <li>Average wait for new claims: The average number of days a veteran filing a claim for the first time waits for a response from the VA.</li>
    <li>Average time to decide an appeal: The average number of days a veteran waits for a response from the VA if they were denied their original claim and had to appeal.</li>
    <li>Completed claims: The number of claims processed by the VA by month.</li>
    <li>Claims received: The number of claims received by the VA by month.</li>
    <li>Claims completed per FTE: The number of claims processed per VA claims employee over the course of a year.</li>
    <li>Employees on duty: Number of claims staff working at the Veterans Service Center at each VA regional office.</li>
    <li>Claims pending >= one year: The number of unprocessed claims at least a year old, including appeals.</li>
</ul> 
