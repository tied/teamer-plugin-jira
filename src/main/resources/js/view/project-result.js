

define('view/project-result', [
    'jquery',
    'backbone',
    'js/mustache'], function($, Backbone,mustache) {

    return Backbone.View.extend({

        tagName : 'div',
        templates: {
            'projectResultContainer' : $('#project-result').html()
        },
        collection: null,
        projectData: null,
        initialize: function (options) {

            //members collection
            this.collection = options.collection;
            this.projectData = options.projectData;
            this.listenTo(this.collection, 'add', this.computeData);
            this.listenTo(this.collection, 'remove', this.computeData);
            this.computeData()
        },

        computeData: function () {
            var projectIncome = this.projectData.projectIncome;
            var costProject = 0,
                okpSum = 0;

            this.collection.each(function(model){
                okpSum += parseInt(model.get('okp'));
                costProject += (parseInt(model.get('cost')) + parseInt(model.get('okp')));
            });
            var result = projectIncome - costProject;
            var profitInPercent = (result / projectIncome) * 100;
            var profitability = profitInPercent.toFixed(2);
            Backbone.trigger('updateProfitTeam',{result: result,id:this.projectData.teamId});

            this.projectResultData = {
                costProject: costProject,
                okpSum: okpSum,
                profitability: profitability,
                result: result
            };

            this.render();
        },
        render: function () {
           this.$el.html(mustache.render(this.templates.projectResultContainer,this.projectResultData));
           return this;
        }
    });
});
