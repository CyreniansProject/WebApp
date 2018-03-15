module.exports.dateRangedSearch = (criteria) => {
    var query = {};

    if(criteria.startDate && criteria.endDate) {
        var sdate = new Date(criteria.startDate);
        var edate = new Date(criteria.endDate);
        query = {
            $gte:sdate,
            $lte:edate
        };
    }
    else if(criteria.startDate) {
        var sdate = new Date(criteria.startDate);
        query = {$gte:sdate};
    }    
    else if(criteria.endDate) {
        var edate = new Date(criteria.endDate);
        query = {$lte:edate};
    }
    
    return query;
}