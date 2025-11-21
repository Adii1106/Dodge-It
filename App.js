import { useState, useEffect } from "react"
import { View, StyleSheet, Dimensions, Text, TouchableWithoutFeedback } from "react-native"
import { Accelerometer } from "expo-sensors"

const scr = Dimensions.get("window")
const W = scr.width
const H = scr.height

const PLAYER_W = 60
const PLAYER_H = 60
const BLOCK_W = 40
const BLOCK_H = 40

export default function App(){

  const [px, setPX] = useState( (W-PLAYER_W)/2 )
  const [drops, setDrops] = useState([])
  const [over, setOver] = useState(false)

  const restart = () => {
    setDrops([])
    setOver(false)
  }

  // Phone movement 
  useEffect(()=>{
    Accelerometer.setUpdateInterval(15)
    const s = Accelerometer.addListener(({x})=>{
      setPX(old=>{
        let p = old + x*30
        if(p<0) p=0
        if(p>W-PLAYER_W) p = W-PLAYER_W
        return p
      })
    })
    return ()=>s.remove()
  },[])

  // initiate block from top 
  useEffect(()=>{
    if(over) return
    const int = setInterval(()=>{
      const d = {
        id: Date.now(),
        x: Math.random()*(W-BLOCK_W),
        y: H
      }
      setDrops(a=> [...a, d])
    }, 900)
    return ()=>clearInterval(int)
  },[over])

  // blocks moving down 
  useEffect(()=>{
    if(over) return
    const t = setInterval(()=>{
      setDrops(arr => arr
        .map(b => ({...b, y:b.y-10}))
        .filter(b => b.y+BLOCK_H > 0)
      )
    }, 50)
    return ()=>clearInterval(t)
  },[over])

  // Collisson Logic
  useEffect(()=>{
    drops.forEach(b=>{
      
      const blockBottom = b.y
      const blockTop = b.y + BLOCK_H
      const blockL = b.x
      const blockR = b.x + BLOCK_W

      const playerBottom = 20
      const playerTop = playerBottom + PLAYER_H
      const pL = px
      const pR = px + PLAYER_W

      const hitVertical = (blockBottom <= playerTop) && (blockTop >= playerBottom)
      const hitHorizontal = blockR > pL && blockL < pR

      if(hitVertical && hitHorizontal){setOver(true)}
    })
    
  }, [drops, px])

  return(
    <TouchableWithoutFeedback onPress={restart}>
      <View style={styles.wrap}>

        {drops.map(d=>(
          <View key={d.id} style={[styles.block, {left:d.x, bottom:d.y}]} />
        ))}

        {!over && (
          <View style={[styles.player, {left:px}]} />
        )}

        {over && (
          <Text style={styles.over}>Game Over (tap to restart)</Text>
        )}

        <Text style={styles.info}>Tilt phone to move</Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  wrap:{
    flex:1,
    backgroundColor:"#000",
    justifyContent:"flex-end",
    alignItems:"center"
  },
  player:{
    position:"absolute",
    bottom:20,
    width:PLAYER_W,
    height:PLAYER_H,
    backgroundColor:"#fff",
    borderWidth:2
  },
  block:{
    position:"absolute",
    width:BLOCK_W,
    height:BLOCK_H,
    backgroundColor:"red"
  },
  over:{
    position:"absolute",
    top:H/2 - 40,
    color:"#fff",
    fontSize:24
  },
  info:{
    position:"absolute",
    top:40,
    color:"#fff"
  }
})
