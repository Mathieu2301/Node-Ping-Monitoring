$(function () {

    var parsedUrl = new URL(window.location.href);
    var ip = parsedUrl.searchParams.get("ip");
    if (ip != "" && ip != null){
        var socket = io(ip);
    }else{
        var socket = io();
    }
    
	var wdate_txt;
	var msg = "null";
    var highest_ping = 0;
    var lowest_ping = 9999;

    var delay = 100;
	var ping = 10;
    
    getinfos();
	sendinfos();
    function getinfos(){
        var start = Date.now();
        socket.emit('ping_test', function clientCallback(infos) {
            ping = (Date.now() - start);
            if (lowest_ping > ping){ lowest_ping = ping; }
            if (highest_ping < ping){ highest_ping = ping; }

            var sdate = new Date(infos.startDate);
            var demarrage_serveur_date = (sdate.getDate()) + "/";
            demarrage_serveur_date += sdate.getMonth() + 1 + " à ";
            demarrage_serveur_date += sdate.getHours() + ":"; 
            demarrage_serveur_date += sdate.getMinutes();
                
            
            if ((infos.workingTime / 1000) < 60){ // infos.workingTime en dessous de 1 minute
                wdate_txt = infos.workingTime / 1000 + " sec";
            }else if (((infos.workingTime / 1000) / 60) < 60){ // infos.workingTime en dessous de 1 heure
                wdate_txt = Math.round((infos.workingTime / 1000) / 60) + " min"
            }else{
                wdate_txt = Math.round(((infos.workingTime / 1000) / 60) / 60) + " heure(s)";
            }
            
            msg = "Serveur = " + window.location.href + " | Ping = " + ping + "ms (" + lowest_ping + "ms ; " + highest_ping + "ms) | Srv_start_date = " + demarrage_serveur_date + " | Srv_runtime = " + wdate_txt + " | Requests = " + infos.requests_nbr + " | Total requests = " + infos.total_requests_nbr + " | Delay = " + delay;

			$('#msg').html(msg);
			
			

			
			
            setTimeout(function() {
                getinfos();
            }, delay);
			
        });
    }
	function sendinfos(){
        socket.emit('infos', {msg: msg, ping: ping});
		setTimeout(function() {
            sendinfos();
        }, 500);
    }
	
	socket.on('getdata', function(data){

		config.data.labels.push(wdate_txt);
		
		if (config.data.datasets[data.id] == null){
			config.data.datasets[data.id] = {
				label: data.id,
				data: [10,1,586,48,6,86,4,56]
			}
			console.log("INIT : " + data.id);
		}
		
		
		config.data.datasets[data.id].label = data.id;
		config.data.datasets[data.id].data.push(data.ping);
		
		myChart.update();
		
		console.log(config.data.datasets);
	});
	
	
	var config = {
		type: 'line',
		data: {
			labels: [],
			datasets: []
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	}
	
	var ctx = $("#myChart");
	var myChart = new Chart(ctx, config);
	
});