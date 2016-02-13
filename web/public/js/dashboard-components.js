// dashboard-components js script
gapi.analytics.ready(function() {

    /**
     * Authorize the user with an access token obtained server side.
     */
    gapi.analytics.auth.authorize({
        'serverAuth': {
            'access_token': 'ya29.hwJqW0B5mwys1OpxqaM7zcGsD7fnEdcRCDd2Uw--ZWQFUC9iNRWOh_IpCdYbq-VrYCj'
        }
    });


    /**
     * Creates a new DataChart instance showing sessions over the past 30 days.
     * It will be rendered inside an element with the id "chart-1-container".
     */
    var dataChart1 = new gapi.analytics.googleCharts.DataChart({
        query: {
            'ids': 'ga:111291353', // AZtec view.
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:sessions,ga:users',
            'dimensions': 'ga:date'
        },
        chart: {
            'container': 'chart-1-container',
            'type': 'LINE',
            'options': {
                'width': '100%'
            }
        }
    });
    dataChart1.execute();


    /**
     * Creates a new DataChart instance showing top 5 most popular demos/tools
     * amongst returning users only.
     * It will be rendered inside an element with the id "chart-3-container".
     */
    var dataChart2 = new gapi.analytics.googleCharts.DataChart({
        query: {
            'ids': 'ga:111291353', // AZtec view.
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:pageviews',
            'dimensions': 'ga:pagePathLevel1',
            'sort': '-ga:pageviews',
            'filters': 'ga:pagePathLevel1!=/',
            'max-results': 7
        },
        chart: {
            'container': 'chart-2-container',
            'type': 'PIE',
            'options': {
                'width': '100%',
                'pieHole': 4/9,
            }
        }
    });
    dataChart2.execute();

});
