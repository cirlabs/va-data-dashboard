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
url = (http://vetsapi.herokuapp.com/api/field-type/)


```
class TimeSeriesData(models.Model):
    city = models.ForeignKey('collector.City')
    field_type = models.ForeignKey('collector.FieldType')
    value = models.FloatField()
    date = models.DateField()
    created = models.DateTimeField()
```
url = (http://vetsapi.herokuapp.com/api/data/)


```
class City(models.Model):
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from=('name',))
```
url = (http://vetsapi.herokuapp.com/api/city/)


