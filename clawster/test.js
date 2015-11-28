var starTime = +( new Date() );
var i = 0;
while( i < 10000000000){
	i++;
}
console.log(i);
var endTime = +( new Date() );
console.log("startTime:"+starTime);
console.log("endTime:" +endTime );
console.log("use:"+(endTime-starTime));