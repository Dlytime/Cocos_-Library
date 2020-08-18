cc.Class({
	extends: cc.Component,    
	properties: {
		zIndex: {
			type: cc.Integer,
			default: 0,            
			notify(oldValue) {                
				if (oldValue === this.zIndex) {               
				    return
				}
				this.node.zIndex = this.zIndex
			}
		}
	},
	onLoad () {        
	    this.node.zIndex = this.zIndex;
	}
});