import { Container,Row,Col } from "react-bootstrap"
import {Image} from "react-bootstrap"
import { Card } from "react-bootstrap"
export const  LandingPage=()=>{
    const arr1=[
        {
            "id":1,
            "image":"https://i.pinimg.com/1200x/56/55/25/565525eeb233a330d9d9b5c183cb8b09.jpg"
        },
        {
            "id":2,
            "image":"https://i.pinimg.com/1200x/5f/7a/42/5f7a421a00ca408e4eab992fd55514fd.jpg"
        }
    ]
    return(
    <>
        <Container fluid style={{backgroundColor:"#6A6C37",
        height:"500px"
        }}>
            <h1>hello</h1>
        </Container>
        <Container fluid>
      <Row>
         <h1>Browse By Category</h1>
          
          {arr1.map((item)=>{
            return(
                <div>
                <Card style={{height:"90px",width:"90px"}} >
                    <Image src={item.image} />
                    </Card>
                    </div>
            )
          })}
        
            </Row>
       </Container>
        </>
    )
}