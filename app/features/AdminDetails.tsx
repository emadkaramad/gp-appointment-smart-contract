import Button from "../components/Button"
import ButtonsRow from "../components/ButtonsRow"
import { Form, TextInput } from "../components/form"
import { H2 } from "../components/Heading"

interface Props {
    onBack: () => void
}

const AdminDetails: React.FC<Props> = ({onBack}) => {
  return (
    <>
      <H2>{"Admin Details"}</H2>
      <Form>
        <TextInput label="Name" onValueChange={(value) => {}} />
        <TextInput label="Address" onValueChange={(value) => {}} />
      </Form>
      <ButtonsRow>
        <Button secondary onClick={onBack}>Cancel</Button>
        <Button onClick={onBack}>Add</Button>
      </ButtonsRow>
    </>
  )
}

export default AdminDetails
