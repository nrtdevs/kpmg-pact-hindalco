import { useState } from 'react'
import { PopoverBody, PopoverHeader, UncontrolledPopover } from 'reactstrap'
import { isValid } from '@src/utility/Utils'
import Show from '@src/utility/Show'
import { getUniqId } from '@src/utility/Utils'
import { Placement } from '@popperjs/core'

const BsPopover = ({
  title,
  Tag = 'span',
  content,
  children,
  placement = 'top',
  trigger = 'legacy',
  popperClassName,
  ...rest
}: {
  title?: any
  Tag?: any
  content: any
  children: any
  placement?: Placement
  trigger?: 'legacy' | 'hover' | 'focus' | 'click' | 'manual' | undefined
  popperClassName?: string
}) => {
  const [id, setId] = useState(getUniqId('popover'))

  if (isValid(content)) {
    return (
      <>
        <UncontrolledPopover
          popperClassName={popperClassName}
          style={{ maxWidth: 500 }}
          trigger={trigger}
          placement={placement}
          target={id}
        >
          <Show IF={isValid(title)}>
            <PopoverHeader>{title}</PopoverHeader>
          </Show>
          <PopoverBody style={{ maxWidth: 500 }}>{content}</PopoverBody>
        </UncontrolledPopover>
        <Tag id={id} {...rest}>
          {children}
        </Tag>
      </>
    )
  } else {
    return (
      <Tag id={id} {...rest}>
        {children}
      </Tag>
    )
  }
}

export default BsPopover
