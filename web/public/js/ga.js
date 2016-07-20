/**
 * Created by awong on 5/20/2016.
 */

var chart;
var popularResourceData;
var popularResourceOptions;
function loadResourceChart(resourceStats, nameToUrlList) {
    resourceChartDrawn = true;
    var google2 = getGoogle();
    google2.charts.load('current', {'packages': ['corechart']});
    //console.log("here0");
    google2.charts.setOnLoadCallback(drawChart);
    function drawChart() {


        dataTable = [];
        colorList = ['red', 'blue', 'yellow', 'green', 'purple', 'magenta', 'orange', ]
        dataTable.push(['Resource Name', 'Visit Count', {role: 'style'}]);
        index = 0;
        for (key in resourceStats) {
            if(key.indexOf("qwertyuiop1234567890") < 0)
                dataTable.push([key, parseInt(resourceStats[key]), 'color: ' + colorList[index]])
            index++;

            //var unsorted = [ ['Sally', 3],['Larry', 2],['Benny', 3],['Sammy', 1]];
            var sorted = dataTable.sort(function (a,b){
                if (b[1] === a[1]) {
                    return b[0] < a[0] ? 1 : b[0] > a[0] ? -1 : 0;
                }
                return b[1] - a[1];
            });
        }

        //console.log(dataTable);
        popularResourceData = google2.visualization.arrayToDataTable(dataTable);

        //console.log(nameToUrlList);

        popularResourceOptions = {
            bar: {groupWidth: "95%"},
            legend: { position: "none" },
            chartArea: {top: 50 }
        };
        chart = new google2.visualization.BarChart(document.getElementById('chart-2-container'));
        //  var chart = new google.visualization.PieChart(document.getElementById('chart-2-container'));

        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                var title = popularResourceData.getValue(selectedItem.row, 0);
                //alert('The user selected ' + topping);
                var url=nameToUrlList[title];
                setTimeout(window.location.href=url, 0)
                //window.location("http://google.com");
            }
        }

        google2.visualization.events.addListener(chart, 'select', selectHandler);
        chart.draw(popularResourceData, popularResourceOptions);
    }
    $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 500);
    });

    //redraw graph when window resize is completed
    $(window).on('resizeEnd', function() {
        chart.draw(popularResourceData, popularResourceOptions);
    });
}





