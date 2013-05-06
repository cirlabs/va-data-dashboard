#Welcome!

The Center for Investigative Reporting has led the nation's coverage on the extent and impact of the (veterans disability backlog)[http://cironline.org/veterans]. We've accumulated 36,600 rows of data pertaining to 58 regional offices across the country from internal and publicly accessible Department of Veterans' Affairs documents. Now, we're releasing this data through an API.

#How to get the data

There are a few ways you can get ahold of the data:

1. Directly accessing the API (see more about how to do this in in the Schema section)
```
curl http://vetsapi.herokuapp.com/api/data/?format=json
```
2. Download the spreadsheets hostd on Amazon s3
```
http://vbl-staging-media.s3.amazonaws.com/data/[CITY]-[FIELD-TYPE].csv
```
3. Use our code to create your own apps. We've created [a few Backbone.js collections and models](https://github.com/cirlabs/va-data-dashboard/blob/master/js/app/va-data.js) that you can use. An example can be found [here](https://github.com/cirlabs/va-data-dashboard)

